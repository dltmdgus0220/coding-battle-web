import { execFile } from 'child_process'; // node.js에서 다른 프로그램을 실행할 때 사용하는 모듈. 여기서는 python 실행하기 위해 import
import { writeFile, unlink } from 'fs/promises'; // 파일시스템을 다루는 node.js 모듈. writeFile: 파일을 생성하거나 덮어씀. unlink: 파일 삭제
import path from 'path';
import os from 'os';

