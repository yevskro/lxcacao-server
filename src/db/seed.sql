INSERT INTO users
  (gmail, first_name, last_name, login_ip, secure_key, img_file_name)
VALUES
  ('root@gmail.com', 'test', 'test', '127.0.0.1', '0001', 'test.png');

INSERT INTO users
  (gmail, first_name, last_name, login_ip, secure_key)
VALUES
  ('admin@gmail.com', 'test', 'test', '127.0.0.1', '0002');

INSERT INTO recipes 
  (name, time, type, private, main_user_id, origin_user_id, origin_user_full_name) 
VALUES
  ('Banana Split', '35m', 'Desert', 'false', 1, 1, 'Yev Skro');