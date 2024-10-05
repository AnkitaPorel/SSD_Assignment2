CREATE TABLE PersonJoining(
	PJoinPK INT AUTO_INCREMENT PRIMARY KEY, EmpIDFK INT,
    FirstName VARCHAR(50), LastName VARCHAR(50), DateOfBirth DATE,
    Age INT, DateOfJoining DATE, DayOfJoining INT, MonthOfJoining INT,
    YearOfJoining INT, WorkExpinDays INT,
    FOREIGN KEY (EmpIDFK) REFERENCES Person(EmpID)
);

DELIMITER ##
CREATE PROCEDURE personJoining()
BEGIN
	DELETE FROM PersonJoining;
    INSERT INTO PersonJoining(EmpIDFK, FirstName, LastName, DateOfBirth, Age,
    DateOfJoining, DayOfJoining, MonthOfJoining, YearOfJoining, WorkExpinDays)
    SELECT EmpID, FirstName, LastName, DateOfBirth, 
           TIMESTAMPDIFF(YEAR, DateOfBirth, CURDATE()) AS Age,
           DateOfJoining, DAY(DateOfJoining) AS DayOfJoining,
           MONTH(DateOfJoining) AS MonthOfJoining, YEAR(DateOfJoining) AS YearOfJoining,
           TIMESTAMPDIFF(DAY, DateOfJoining, CURDATE()) AS WorkExpinDays
	FROM Person;
END ##
DELIMITER ;

CALL personJoining();
SELECT * FROM PersonJoining;
