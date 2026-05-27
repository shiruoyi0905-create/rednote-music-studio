const templateNames = ["曲名弹唱", "黄字爆点", "教程种草", "氛围歌词"];

function CoverMock({ mode = "empty" }: { mode?: "empty" | "cover" | "vinyl" }) {
  if (mode === "vinyl") {
    return (
      <div className="prototype-cover prototype-cover-dark">
        <div className="prototype-vinyl">
          <div />
        </div>
        <p>My Jinji</p>
      </div>
    );
  }

  if (mode === "cover") {
    return (
      <div className="prototype-cover prototype-photo">
        <span className="prototype-play">▶</span>
        <div className="prototype-title-sticker">
          <b>弹唱博主</b>
          <b>录音设备分享!</b>
        </div>
      </div>
    );
  }

  return (
    <div className="prototype-cover prototype-empty">
      <b>上传参考图后预览</b>
      <span>生成结果会显示在这里</span>
    </div>
  );
}

function StepCard({
  index,
  title,
  children,
}: {
  index: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="prototype-step">
      <span>{index}</span>
      <div>
        <b>{title}</b>
        {children}
      </div>
    </div>
  );
}

function TemplateGrid() {
  return (
    <div className="prototype-template-grid">
      {templateNames.map((name, index) => (
        <button key={name} className={index === 0 ? "active" : ""}>
          <b>{name}</b>
          <span>{index === 0 ? "白字歌名款" : "小红书贴字风"}</span>
        </button>
      ))}
    </div>
  );
}

export default function PrototypePage() {
  return (
    <main className="prototype-page">
      <header>
        <p>封面生成动线原型</p>
        <h1>三种方案对比</h1>
        <span>用于确认信息层级和用户操作顺序，不影响当前工作台。</span>
      </header>

      <section className="prototype-grid">
        <article className="prototype-panel recommended">
          <div className="prototype-panel-head">
            <div>
              <p>方案 A + C</p>
              <h2>爆款封面优先</h2>
            </div>
            <em>推荐</em>
          </div>

          <CoverMock />

          <div className="prototype-flow">
            <StepCard index={1} title="上传参考图">
              <p>选择弹唱照片 / 截图作为二创底图</p>
            </StepCard>
            <StepCard index={2} title="选择封面风格">
              <TemplateGrid />
            </StepCard>
            <StepCard index={3} title="生成并预览">
              <button className="prototype-primary">生成爆款封面</button>
            </StepCard>
          </div>
        </article>

        <article className="prototype-panel">
          <div className="prototype-panel-head">
            <div>
              <p>方案 B</p>
              <h2>保留预览类型</h2>
            </div>
          </div>

          <div className="prototype-tabs">
            <button className="active">爆款封面</button>
            <button>黑胶氛围</button>
          </div>
          <CoverMock mode="cover" />

          <div className="prototype-flow compact">
            <StepCard index={1} title="上传参考图">
              <p>先有底图，再生成</p>
            </StepCard>
            <StepCard index={2} title="选择风格">
              <TemplateGrid />
            </StepCard>
            <StepCard index={3} title="生成封面">
              <button className="prototype-primary">生成封面</button>
            </StepCard>
          </div>
        </article>

        <article className="prototype-panel">
          <div className="prototype-panel-head">
            <div>
              <p>方案 A</p>
              <h2>极简主线</h2>
            </div>
          </div>

          <CoverMock mode="cover" />

          <div className="prototype-simple-actions">
            <button>上传图片</button>
            <button>选风格</button>
            <button className="prototype-primary">生成封面</button>
          </div>

          <div className="prototype-note">
            黑胶预览作为次级氛围模块，下移或折叠，不抢封面生成主流程。
          </div>
        </article>
      </section>
    </main>
  );
}
