export const entries = [
	{
		id: 1,
		content: 'SELECT * FROM users WHERE id = 1;',
		timestamp: new Date('2023-10-01T10:00:00Z')
	},
	{
		id: 2,
		content: "UPDATE users SET name = 'John Doe' WHERE id = 1;",
		timestamp: new Date('2023-10-02T11:30:00Z')
	},
	{
		id: 3,
		content: 'DELETE FROM users WHERE id = 2;',
		timestamp: new Date('2023-10-03T14:45:00Z')
	},
	{
		id: 4,
		content: "INSERT INTO users (name, email) VALUES ('Jane Doe', 'jane.doe@example.com');",
		timestamp: new Date('2023-10-04T09:15:00Z')
	},
	{
		id: 5,
		content: 'SELECT * FROM orders WHERE user_id = 1;',
		timestamp: new Date('2023-10-05T16:00:00Z')
	}
];
