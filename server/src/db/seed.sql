-- 샘플 문제 1: 두 수의 합
INSERT INTO problems (title, description, input_format, output_format, sample_input, sample_output, difficulty, time_limit_sec)
VALUES (
  '두 수의 합',
  '두 정수 A와 B가 주어졌을 때, A+B를 출력하세요.',
  '첫 번째 줄에 정수 A와 B가 공백으로 구분되어 주어진다. (1 ≤ A, B ≤ 1000)',
  'A+B의 값을 출력한다.',
  '1 2',
  '3',
  'easy',
  60
);

-- 테스트케이스 (문제 1)
INSERT INTO test_cases (problem_id, input, expected_output, is_sample)
VALUES
  (1, '1 2', '3', TRUE),
  (1, '10 20', '30', FALSE),
  (1, '100 200', '300', FALSE),
  (1, '999 1', '1000', FALSE),
  (1, '500 500', '1000', FALSE);

-- 샘플 문제 2: 최대값 찾기
INSERT INTO problems (title, description, input_format, output_format, sample_input, sample_output, difficulty, time_limit_sec)
VALUES (
  '최대값 찾기',
  'N개의 정수가 주어졌을 때, 가장 큰 수를 출력하세요.',
  '첫 번째 줄에 N이 주어진다. (1 ≤ N ≤ 100)
두 번째 줄에 N개의 정수가 공백으로 구분되어 주어진다. (각 수는 -1000 이상 1000 이하)',
  '가장 큰 정수를 출력한다.',
  '5
3 1 4 1 5',
  '5',
  'easy',
  60
);

-- 테스트케이스 (문제 2)
INSERT INTO test_cases (problem_id, input, expected_output, is_sample)
VALUES
  (2, '5\n3 1 4 1 5', '5', TRUE),
  (2, '3\n-1 -5 -3', '-1', FALSE),
  (2, '1\n42', '42', FALSE),
  (2, '4\n100 200 150 50', '200', FALSE),
  (2, '6\n0 0 0 0 0 1', '1', FALSE);

-- 샘플 문제 3: 문자열 뒤집기
INSERT INTO problems (title, description, input_format, output_format, sample_input, sample_output, difficulty, time_limit_sec)
VALUES (
  '문자열 뒤집기',
  '문자열이 주어졌을 때, 해당 문자열을 뒤집어 출력하세요.',
  '첫 번째 줄에 문자열이 주어진다. (1 ≤ 길이 ≤ 1000, 영문 소문자로만 구성)',
  '뒤집힌 문자열을 출력한다.',
  'hello',
  'olleh',
  'easy',
  60
);

-- 테스트케이스 (문제 3)
INSERT INTO test_cases (problem_id, input, expected_output, is_sample)
VALUES
  (3, 'hello', 'olleh', TRUE),
  (3, 'abcde', 'edcba', FALSE),
  (3, 'a', 'a', FALSE),
  (3, 'python', 'nohtyp', FALSE),
  (3, 'racecar', 'racecar', FALSE);
