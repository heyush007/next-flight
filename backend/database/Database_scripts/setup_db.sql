Setup Database step by step guide. 

1. Download the sql script provided by the school. 
2. Download and install latest MariaDB into your system
3. Create database named : flight_sim
4. Import sql script provided by school by using this line in the command prompt.
 mysql -u root -p flight_sim < flight_simulator_database_script.sql
— if you can import it, navigate to the directory that consist the sql script file and then try it. 
- remember not to forget the password of the root, database. 
5. Once the import is done, check 
mysql -u root -p flight_sim
- and once you are connected, try writing 
Show tables; to check if the import were successfully done. 

NOW MOVING ON TO THE NEXT IMPORT. 
In order to import the new tables directly go through the following steps
1. Set the last foreign keys to 0 by
SET FOREIGN_KEY_CHECKS = 0;
2. After that create tables as shown in the .sql file i.e. {setup_db.sql}
- Create weather table
CREATE TABLE Weather (
                         id INT AUTO_INCREMENT PRIMARY KEY,
                         `condition` VARCHAR(50) NOT NULL,
                         temperature DECIMAL(5, 2),
                         wind_speed DECIMAL(5, 2),
                         humidity INT,
                         visibility DECIMAL(5, 2)
);
- Create User table
CREATE TABLE User (
                      id INT AUTO_INCREMENT PRIMARY KEY,
                      username VARCHAR(255) NOT NULL UNIQUE,
                      fuel_consumed INT DEFAULT 500
);
- Create User_flight_log table
CREATE TABLE User_Flight_Log (
                                 id INT AUTO_INCREMENT PRIMARY KEY,
                                 user_id INT,
                                 flight_id INT,
                                 weather_id INT,
                                 flight_time TIME,
                                 completion_status VARCHAR(50),
                                 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                                 FOREIGN KEY (user_id) REFERENCES User(id) ON DELETE CASCADE,
                                 FOREIGN KEY (flight_id) REFERENCES Flight(id) ON DELETE CASCADE,
                                 FOREIGN KEY (weather_id) REFERENCES Weather(id) ON DELETE SET NULL
);
ALTER TABLE Airport MODIFY id INT;  -- Or use the correct type (e.g., `UNSIGNED`)
ALTER TABLE Airport ENGINE=InnoDB;
DROP TABLE IF EXISTS Flight;
ALTER TABLE airport MODIFY id INT NOT NULL;
ALTER TABLE airport DROP PRIMARY KEY, ADD PRIMARY KEY (id);
ALTER TABLE User MODIFY fuel_consumed INT DEFAULT 500;

- finally create table flight
CREATE TABLE Flight (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        departure_airport_id INT,
                        arrival_airport_id INT,
                        scheduled_departure_time DATETIME,
                        scheduled_arrival_time DATETIME,
                        FOREIGN KEY (departure_airport_id) REFERENCES Airport(id) ON DELETE CASCADE,
                        FOREIGN KEY (arrival_airport_id) REFERENCES Airport(id) ON DELETE CASCADE
);

- now drop the not required tables 
DROP TABLE IF EXISTS goal_reached;
DROP TABLE IF EXISTS goal;
DROP TABLE IF EXISTS game;

- new updates in the alterations of column 
 ALTER TABLE User DROP FOREIGN KEY user_ibfk_1;
 ALTER TABLE User MODIFY COLUMN fuel_consumed INT;

- Add another table Checkpoint 

CREATE TABLE Checkpoint (
                            id INT AUTO_INCREMENT PRIMARY KEY,
                            user_flight_id INT,
                            weather_id INT,
                            checkpoint_time TIMESTAMP,
                            location_coordinates VARCHAR(255),
                            status VARCHAR(50),
                            FOREIGN KEY (user_flight_id) REFERENCES User_Flight_Log(id) ON DELETE CASCADE,
                            FOREIGN KEY (weather_id) REFERENCES Weather(id) ON DELETE SET NULL
);

- Add another table achievements

CREATE TABLE IF NOT EXISTS Achievements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    achievement_name VARCHAR(255),
    achievement_description TEXT,
    status VARCHAR(50),
    FOREIGN KEY (user_id) REFERENCES User(id)
);

- Added hurdles in the database as well for now. 

-- Create Hurdles table
CREATE TABLE IF NOT EXISTS Hurdles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    level INT NOT NULL,
    description TEXT NOT NULL,
    correct_option INT NOT NULL,
    result TEXT NOT NULL,
    complexity INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert all existing hurdles
INSERT INTO Hurdles (level, description, correct_option, result, complexity) VALUES
-- Level 1 Hurdles
(1, 'Mild turbulence ahead. Do you adjust your speed (1) or maintain current speed (2)?',
 1, 'Successfully adjusted speed to navigate turbulence.', 20),
(1, 'The weather is clear, but there''s a minor mechanical issue. Do you continue flying (1) or check your instruments (2)?',
 2, 'You identified the issue and fixed it.', 10),
(1, 'A slight wind from the north. Do you adjust your course (1) or maintain your heading (2)?',
 1, 'You successfully adjusted the course to compensate for the wind.', 15),
(1, 'You receive a radio call for potential hazards. Do you respond (1) or continue without checking (2)?',
 1, 'Communication established. You avoided hazards.', 10),
(1, 'Clear skies but sudden headwinds. Do you increase thrust (1) or maintain current speed (2)?',
 1, 'Increased thrust and stabilized the flight.', 20),

-- Level 2 Hurdles
(2, 'Moderate turbulence is shaking the plane. Do you climb higher (1) or descend (2)?',
 2, 'Successfully descended to avoid turbulence.', 30),
(2, 'A rainstorm is approaching. Do you fly around it (1) or go through it (2)?',
 1, 'You safely navigated around the storm.', 25),
(2, 'Crosswinds are intensifying. Do you adjust the rudder (1) or keep it steady (2)?',
 1, 'Correctly adjusted the rudder to counter crosswinds.', 30),
(2, 'Visibility is reduced by rain. Do you slow down (1) or maintain speed (2)?',
 1, 'You slowed down and maintained control.', 20),
(2, 'You spot heavy clouds ahead. Do you fly above them (1) or navigate below them (2)?',
 2, 'Safely flew below the clouds.', 25),

-- Level 3 Hurdles
(3, 'Strong winds from the east are pushing the plane off course. Do you adjust heading (1) or increase speed (2)?',
 1, 'You adjusted heading and stayed on course.', 35),
(3, 'Heavy rain is limiting visibility. Do you rely on instruments (1) or reduce altitude (2)?',
 1, 'You used instruments and safely continued the flight.', 40),
(3, 'The temperature is dropping rapidly. Do you activate de-icing (1) or continue as normal (2)?',
 1, 'You activated de-icing and avoided potential hazards.', 40),
(3, 'Sudden gusts of wind are causing turbulence. Do you change altitude (1) or slow down (2)?',
 1, 'You changed altitude and stabilized the flight.', 35),
(3, 'Lightning is striking near your path. Do you alter your route (1) or maintain heading (2)?',
 1, 'You altered your route and avoided danger.', 50),

-- Level 4 Hurdles
(4, 'A severe snowstorm is ahead. Do you fly over it (1) or try to fly around it (2)?',
 2, 'You successfully flew around the snowstorm.', 60),
(4, 'Heavy snow and strong winds are reducing visibility. Do you rely entirely on instruments (1) or reduce speed (2)?',
 1, 'You relied on instruments and safely navigated the conditions.', 55),
(4, 'The temperature is extremely low, and ice is forming. Do you climb to a warmer altitude (1) or activate de-icing (2)?',
 2, 'You activated de-icing and prevented ice buildup.', 50),
(4, 'Blizzard conditions are making it hard to see. Do you decrease altitude (1) or maintain heading (2)?',
 1, 'You decreased altitude and maintained control.', 55),
(4, 'Sudden wind shear is causing instability. Do you adjust the flaps (1) or increase thrust (2)?',
 1, 'You adjusted the flaps and stabilized the plane.', 60);

-- Create index for faster level-based queries
CREATE INDEX idx_hurdles_level ON Hurdles(level);

-- Add a view for hurdle statistics (optional but useful)
CREATE OR REPLACE VIEW hurdle_stats AS
SELECT 
    level,
    COUNT(*) as hurdle_count,
    AVG(complexity) as avg_complexity,
    MIN(complexity) as min_complexity,
    MAX(complexity) as max_complexity
FROM Hurdles
GROUP BY level
ORDER BY level;


 