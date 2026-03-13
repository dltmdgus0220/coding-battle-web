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

