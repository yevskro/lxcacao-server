INSERT INTO users
  (gmail, first_name, last_name, login_ip, secure_key)
VALUES
  ('root@gmail.com', 'test', 'test', '127.0.0.1', '0001');

INSERT INTO users
  (gmail, first_name, last_name, login_ip, secure_key)
VALUES
  ('admin@gmail.com', 'test', 'test', '127.0.0.1', '0002');

INSERT INTO recipes 
  (name, time, type, private) 
VALUES
  ('Banana Split', '35m', 'Desert', 'false');