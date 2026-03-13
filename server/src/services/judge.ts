import { execFile } from 'child_process'; // node.js에서 다른 프로그램을 실행할 때 사용하는 모듈. 여기서는 python 실행하기 위해 import
import { writeFile, unlink } from 'fs/promises'; // 파일시스템을 다루는 node.js 모듈. writeFile: 파일을 생성하거나 덮어씀. unlink: 파일 삭제
import path from 'path';
import os from 'os';

interface JudgeResult {
  status: string;
  passedCases: number;
  totalCases: number;
}

interface TestCase {
  input: string;
  expected_output: string;
}

function runPython(filePath: string, stdin: string, timeoutMs: number): Promise<string> {
  return new Promise((resolve, reject) => { // 성공 시 resolve 반환. 실패 시 reject 반환
    const child = execFile(
      'python',
      [filePath], // 터미널에 "python filepath"를 실행하는 것과 같음.
      { timeout: timeoutMs }, // timeout은 execFile에 존재하는 옵션. timeoutMs가 되면 프로세스 강제종료.
      (error, stdout, stderr) => { // error: 실행 중 에러 발생 여부, stdout: 프로그램의 정상 출력, stderr: 프로그램의 에러 출력
        if (error) {
          if (error.killed) { // 프로세스가 강제종료되었는지. 여기서 강제종료는 타임아웃밖에 없음.
            reject(new Error('Time Limit Exceeded'));
          } else {
            reject(new Error(`Runtime Error: ${stderr || error.message}`));
          }
          return;
        }
        resolve(stdout);
      }
    );
    if (child.stdin) { // 테스트 케이스 입력
      child.stdin.write(stdin);
      child.stdin.end();
    }
  });
}

export async function judgeCode(code: string, testCases: TestCase[]): Promise<JudgeResult> {
  const tmpFile = path.join(os.tmpdir(), `judge_${Date.now()}_${Math.random().toString(36).slice(2)}.py`); // math.random()은 약 53비트 정밀도를 가지기 때문에 표현 가능한 값의 개수가 제한되어있어서 엄청 긴 문자열이 나오진 않음.
  let passedCases = 0;
  const totalCases = testCases.length;

  try {
    await writeFile(tmpFile, code, 'utf8'); // 임시로 파이썬 파일 생성

    for (const tc of testCases) { // 테스트 케이스 검증
      try {
        // seed.sql의 \n을 실제 줄바꿈으로 변환
        const stdin = tc.input.replace(/\\n/g, '\n'); // "/문자열/": 문자열 찾는 정규식, g: 전체(global)에서 찾기
        const expected = tc.expected_output.trim(); // 앞뒤 공백 제거. 파이썬에서 strip()과 같은 역할.

        const output = await runPython(tmpFile, stdin, 5000);
        const actual = output.trim();

        if (actual === expected) {
          passedCases++;
        } else {
          // 오답: 나머지 케이스도 계속 채점
          continue;
        }
      } catch (err: unknown) { // err 타입이 뭔지 모르기 때문에 unknown으로 해서 typescript가 오류나는 걸 방지
        const msg = err instanceof Error ? err.message : String(err); // err이 Error 객체면 err.message를 반환하고 아니면 String(err) 반환.
        const status = msg.startsWith('Time Limit') ? 'Time Limit Exceeded' : 'Runtime Error';
        return { status, passedCases, totalCases };
      }
    }

    const status = passedCases === totalCases ? 'Accepted' : 'Wrong Answer'; // 테스트 케이스를 다 맞췄는지 확인
    return { status, passedCases, totalCases };
  } finally {
    unlink(tmpFile).catch(() => {});
  }
}
