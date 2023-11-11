export default function Main(){
  return (
    <main>
      <div className="workspace">
        <div className="workspace-tabs">
          <button className="create-editor-button" title="New Editor"><svg><use href="#close_icon"/></svg></button>
        </div>
        <div className="workspace-editors"/>
      </div>
      <div className="scaler"/>
      <iframe className="preview" src="about:blank"/>
      <div className="card-backdrop"/>
    </main>
  );
}