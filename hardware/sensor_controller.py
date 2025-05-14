from machine import SoftI2C, Pin, I2C
import time
from max30102 import MAX30102, MAX30105_PULSE_AMP_MEDIUM
import math

class SensorController:
    def __init__(self):
        # I2C software instance
        self.i2c = SoftI2C(sda = Pin(21), scl = Pin(22), freq=400000)

        # Sensor instance
        self.sensor = MAX30102(i2c=self.i2c)

        # Scan I2C bus to ensure that the sensor is connected
        if self.sensor.i2c_address not in self.i2c.scan():
            print("Sensor not found.")
            return
        elif not self.sensor.check_part_id():
            # Check that the targeted sensor is compatible
            print("I2C device ID not corresponding to MAX30102")
            return
        else:
            print("Sensor connected and recognized.")

        # Set up sensor with default configuration
        self.sensor.setup_sensor()
        self.sensor.set_sample_rate(3200)
        self.sensor.set_fifo_average(8)
        self.sensor.set_active_leds_amplitude(MAX30105_PULSE_AMP_MEDIUM)

        print("Starting data acquisition from RED & IR registers...")
    
        self.samples_n = 0  # Number of samples that have been collected



        #stores the calculated bpm
        self.bpm = 0
        #arrays to store the last x values of ir change and bpm and spO2 so they can be averaged
        self.irChngStor = [0] * 5
        self.bpmStor = [0] * 10
        self.spO2Stor = [0] * 20
        #hold ir values so that we can calculate the change between values
        self.prev = 0
        self.curr = 0
        #bool for if we are looking for a peak or not
        self.lookpeak = True
        #to store when we check a beat and can compare the difference in time to calculate bpm
        self.millis = time.ticks_ms()
        #store the highest and lowest ir and red values from between each beat, for spo2 calculation
        self.irHigh = 0
        self.irLow = 1000000
        self.redHigh = 0
        self.redLow = 1000000
    
    def get_values(self, dati):
        # The check() method has to be continuously polled, to check if
        # there are new readings into the sensor's FIFO queue. When new
        # readings are available, this function will put them into the storage.
        self.sensor.check()
        
        # Check if the storage contains available samples
        if self.sensor.available():
            # Access the storage FIFO and gather the readings (integers)
            red_reading = self.sensor.pop_red_from_storage()
            ir_reading = self.sensor.pop_ir_from_storage()
            
            #calculate the change in ir value between last two reads and add it to the list and calculate the average of the last 5
            self.prev = self.curr
            self.curr = ir_reading
            self.irChngStor.pop(0)
            self.irChngStor.append(self.curr - self.prev)
            avgChng = sum(self.irChngStor) / 5
            
            #if weve just passed a peak and were looking for a peak calculate bpm
            if avgChng < -5 and self.lookpeak:
                # calulate bpm as ms per second/ms between beats
                self.bpm = 60000 / (time.ticks_ms() - self.millis)
                #reset the time stored for the start of time between this beat and the next
                self.millis = time.ticks_ms()
                # remove oldest and add newest beat to array for averaging
                self.bpmStor.pop(0)
                self.bpmStor.append(self.bpm)
                
                #print average of the last ten bpm eliminate the high and low values
                self.bpm = ((sum(self.bpmStor) - (max(self.bpmStor) + min(self.bpmStor))) / (len(self.bpmStor) - 2))
                #print("bpm", round(bpm))
                PR = self.bpm
                self.lookpeak = False
                
                #find spo2
                #remove oldest spO2 value and add newest
                self.spO2Stor.pop(0)
                self.spO2Stor.append(self.calculate_spO2(self.redHigh, self.redLow, self.irHigh, self.irLow))
                #average the array of stored spO2 values but remove max and min values (possible outliers)
                self.spO2local = ((sum(self.spO2Stor) - (max(self.spO2Stor) + min(self.spO2Stor))) / (len(self.spO2Stor) - 2))
                #print("spO2", round(spO2local, 2))
                SPO2 = self.spO2local
                #reset vals for next beat
                self.irHigh = 0
                self.irLow = 100000
                self.redHigh = 0
                self.redLow = 100000
                
                #output bpm and SP02 to the Oled display
                bpmOutput = round(self.bpm)
                spo2Output = round(self.spO2local)
                if spo2Output > 100:
                    spo2Output = 100
                #updates the value for the external output
                dati[0] = spo2Output
                dati[1] = bpmOutput
                
            #if were not looking for a beat check if we should be looking for a beat
            elif avgChng > 0.5 and not self.lookpeak:
                self.lookpeak = True
                
            #see if values are the high or low value in the beat
            if (ir_reading > self.irHigh):
                self.irHigh = ir_reading
            if (ir_reading < self.irLow):
                self.irLow = ir_reading
            if (red_reading > self.redHigh):
                self.redHigh = red_reading
            if (red_reading < self.redLow):
                self.redLow = red_reading
    
    def calculate_spO2(self, red_max, red_min, ir_max, ir_min):
        red_DC = (red_max + red_min) / 2
        red_AC = red_max - red_min
    
        ir_DC = (ir_max + ir_min) / 2
        ir_AC = ir_max - ir_min
    
        R_val = (red_AC / red_DC) / (ir_AC / ir_DC)
        #print("R:", R_val)
    
        #spO2 = R_val * 49.48
        #spO2 = 116.6 - (34.5 * R_val)
        spO2 = 110 - (25 * R_val)
        #spO2 = (1.5958422 * (R_val * R_val)) + (-34.6596622 * R_val) + 112.6898759
        return spO2