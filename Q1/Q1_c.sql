CREATE TABLE PersonTransfer(
	PTPK INT AUTO_INCREMENT PRIMARY KEY, EmpIDFK INT,
    FirstName VARCHAR(50), LastName VARCHAR(50), Gender VARCHAR(1),
    DateOfJoining DATE, CurrentRegion VARCHAR(50), NewRegion VARCHAR(50),
    FOREIGN KEY (EmpIDFK) REFERENCES Person(EmpID)
);

DELIMITER ##
CREATE PROCEDURE personTransfer()
BEGIN
	DELETE FROM PersonTransfer;
    INSERT INTO PersonTransfer(EmpIDFK, FirstName, LastName, Gender, DateOfJoining, CurrentRegion, NewRegion)
    SELECT EmpID, FirstName, LastName, Gender, DateOfJoining, Region,
		   CASE 
               WHEN Gender = 'F' AND TIMESTAMPDIFF(YEAR, DateofJoining, CURDATE()) > 10 THEN 'DC' 
               WHEN Gender = 'M' AND TIMESTAMPDIFF(YEAR, DateofJoining, CURDATE()) > 20 THEN 'Capitol' 
               ELSE Region
           END
           AS NewRegion
	FROM Person;
END ##
DELIMITER ;

CALL personTransfer();
SELECT * FROM PersonTransfer;
