import Editor from '@monaco-editor/react'; // 웹에서도 vscode처럼 코드 작성 기능 제공하는 에디터 라이브러리

interface CodeEditorProps {
  value: string;
  onChange?: (value: string) => void; // onChange: string 타입의 value 값을 인자로 받고 void 값을 결과로 리턴하는 함수
  readOnly?: boolean;
  height?: string;
} // ?는 있어도 되고 없어도 된다는 의미

export default function CodeEditor({ value, onChange, readOnly = false, height = '400px' }: CodeEditorProps) {
  return (
    <Editor
      height={height}
      language="python"
      value={value}
      onChange={(val) => onChange?.(val || '')}
      theme="vs-dark"
      options={{
        readOnly,
        fontSize: 14,
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        wordWrap: 'on',
        tabSize: 4,
      }}
    />
  );
}
