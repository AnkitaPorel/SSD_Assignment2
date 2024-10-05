DELIMITER ##
CREATE PROCEDURE employee()
BEGIN
	SELECT Region,
    SUM(CASE WHEN HOUR(TimeOfBirth) < 9 OR (HOUR(TimeOfBirth) = 9 
		AND MINUTE(TimeOfBirth) = 0)
        THEN 1 ELSE 0 END)
	AS "No. of Employees born between 00:00 and 09:00 hours",
    SUM(CASE WHEN (HOUR(TimeOfBirth) = 9 AND MINUTE(TimeOfBirth) > 0)
		OR (HOUR(TimeOfBirth) BETWEEN 10 AND 15)
        OR (HOUR(TimeOfBirth) = 16 AND MINUTE(TimeOfBirth) = 0)
        THEN 1 ELSE 0 END)
	AS "No. of Employees born between 09:01 and 16:00 hours",
    SUM(CASE WHEN (HOUR(TimeOfBirth) = 16 AND MINUTE(TimeOfBirth) > 0)
		OR (HOUR(TimeOfBirth) BETWEEN 17 AND 22)
        THEN 1 ELSE 0 END)
	AS "No. of Employees born after 16:01 until 22:59 hours"
FROM Person
GROUP BY Region;
END ##
DELIMITER ;

CALL employee();
