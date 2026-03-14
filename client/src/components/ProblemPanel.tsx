interface Problem {
  id: number;
  title: string;
  description: string;
  input_format: string;
  output_format: string;
  sample_input: string;
  sample_output: string;
  difficulty: string;
  time_limit_sec: number;
}

interface ProblemPanelProps {
  problem: Problem;
}

export default function ProblemPanel({ problem }: ProblemPanelProps) {
  return (
    <div className="problem-panel">
      <div className="problem-header">
        <h2>{problem.title}</h2>
        <span className={`difficulty difficulty-${problem.difficulty}`}>{problem.difficulty}</span>
      </div>
      <section className="problem-section">
        <h3>문제 설명</h3>
        <p>{problem.description}</p>
      </section>
      <section className="problem-section">
        <h3>입력 형식</h3>
        <p>{problem.input_format}</p>
      </section>
      <section className="problem-section">
        <h3>출력 형식</h3>
        <p>{problem.output_format}</p>
      </section>
      <section className="problem-section">
        <h3>예제</h3>
        <div className="sample-io">
          <div>
            <h4>입력</h4>
            <pre>{problem.sample_input}</pre>
          </div>
          <div>
            <h4>출력</h4>
            <pre>{problem.sample_output}</pre>
          </div>
        </div>
      </section>
    </div>
  );
}
