CREATE TABLE users (
    userid INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255),
    email VARCHAR(255),
    password VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
  -- Tạo bảng messages
  CREATE TABLE messages (
    me_id INT AUTO_INCREMENT PRIMARY KEY,
    sender_id INT,
    receiver_id INT,
    content TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

   INSERT INTO users (username, email, password) VALUES
    ('trungson01', 'trungson@gmail.com', 'trungson01'),
    ('trungson02', 'trungson02@example.com', 'trungson02');
  INSERT INTO messages (sender_id, receiver_id, content) VALUES
    (1, 2, 'Hello trungson02!'),
    (2, 1, 'Hi trungson01!');