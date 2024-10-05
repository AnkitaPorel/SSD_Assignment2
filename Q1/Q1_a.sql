CREATE DATABASE ASSIGNMENT;

USE ASSIGNMENT;

CREATE TABLE Person(
	EmpID INT PRIMARY KEY, NamePrefix VARCHAR(10),
    FirstName VARCHAR(50), MiddleInitial VARCHAR(1),
    LastName VARCHAR(50), Gender VARCHAR(1), email VARCHAR(100),
    FatherName VARCHAR(100), MotherName VARCHAR(100),
    MotherMaidenName VARCHAR(100), DateOfBirth DATE,
    TimeOfBirth TIME, Weight INT, DateOfJoining DATE,
    Salary INT, LastHike INT, PlaceName VARCHAR(100),
    County VARCHAR(50), City VARCHAR(50), State VARCHAR(10),
    Region VARCHAR(50)
);

LOAD DATA INFILE '/var/lib/mysql-files/empdetails.csv'
INTO TABLE Person
FIELDS TERMINATED BY ','
LINES TERMINATED BY '\n'
IGNORE 1 ROWS
(
	@EmpID, NamePrefix, FirstName, MiddleInitial, LastName, Gender,
    email, FatherName, MotherName, MotherMaidenName, @DateOfBirth,
    @TimeOfBirth, Weight, @DateOfJoining, Salary, @LastHike,
    PlaceName, County, City, State, Region
)
SET
	EmpID = CAST(@EmpID AS UNSIGNED),
	DateOfBirth = STR_TO_DATE(@DateOfBirth, '%m/%d/%Y'),
    TimeOfBirth = STR_TO_DATE(@TimeOfBirth, '%I:%i:%s %p'),
    DateOfJoining = STR_TO_DATE(@DateOfJoining, '%m/%d/%Y'),
    LastHike = CAST(REPLACE(@LastHike,'%','') AS UNSIGNED);
    
CREATE TABLE hike2024(
	HikePK INT AUTO_INCREMENT PRIMARY KEY,
    EmpIDFK INT,
	FirstName VARCHAR(50), LastName VARCHAR(50),
    Gender VARCHAR(1), WeightInKg INT,
    LastHike INT, LastSalary INT, NewHike INT, NewSalary INT,
	FOREIGN KEY (EmpIDFK) REFERENCES Person(EmpID)
);

DELIMITER ##
CREATE PROCEDURE hike()
BEGIN
	DELETE FROM hike2024;
    INSERT INTO hike2024(EmpIDFK, FirstName, LastName, Gender, WeightInKg, LastHike, LastSalary, NewHike, NewSalary)
    SELECT EmpID, FirstName, LastName, Gender, Weight, LastHike, Salary,
           LastHike + 12,
           Salary + (Salary * (LastHike + 12) / 100)
    FROM Person
    WHERE Weight < 55;
END ##
DELIMITER ;

CALL hike();
SELECT * FROM hike2024;
