CREATE VIEW grouped_donations AS
    SELECT charity_id, event_id, COUNT(*)
    FROM donations
    GROUP BY charity_id, event_id;