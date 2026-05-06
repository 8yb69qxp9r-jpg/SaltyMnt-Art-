// Salty Mountain — 10 Pinterest pin templates
// Every mountain image is an <image-slot id=...> drop-zone. Drag any photo onto
// it; it persists. Each slot has a unique id so drops survive reload.
//
// Designed at native 1000x1500 (2:3) and rendered inside DCArtboards scaled to 360x540.

const PIN_W = 1000;
const PIN_H = 1500;

const ink = '#0e0e0e';
const paper = '#f4f1ec';
const fog = '#a9a59f';
const stone = '#3a3633';

const pinShell = {
  width: PIN_W,
  height: PIN_H,
  position: 'relative',
  overflow: 'hidden',
  fontFamily: '"Inter", "Helvetica Neue", Helvetica, Arial, sans-serif',
  color: ink,
  background: paper,
  transformOrigin: 'top left',
};

// ----- ImageSlot helper --------------------------------------------------
// Wraps the <image-slot> custom element. The grayscale + contrast filter is
// applied via a CSS rule so it sticks to whatever image the user drops in.
// Each slot has a distinct id so the persistence sidecar can store all 14+
// drops independently.

function MtnSlot({ id, style, placeholder = 'Drop summit photo', bw = true, fallback }) {
  const ref = React.useRef(null);
  React.useEffect(() => {
    if (!bw || !ref.current) return;
    const root = ref.current.shadowRoot;
    if (!root) return;
    // Ensure dropped images render in B&W per the brand spec.
    if (!root.getElementById('__bw-style')) {
      const s = document.createElement('style');
      s.id = '__bw-style';
      s.textContent = 'img, .img, [part="img"], div { filter: grayscale(100%) contrast(1.06); }';
      root.appendChild(s);
    }
  });
  return (
    <image-slot
      ref={ref}
      id={id}
      style={style}
      placeholder={placeholder}
      src={fallback}
    />
  );
}

const Wordmark = ({ light = false }) => (
  <div style={{
    position: 'absolute', top: 36, left: 40,
    display: 'flex', alignItems: 'center', gap: 10,
    color: light ? 'rgba(255,255,255,.92)' : ink,
    fontFamily: '"JetBrains Mono", "SF Mono", ui-monospace, monospace',
    fontSize: 18, letterSpacing: '0.22em', textTransform: 'uppercase', fontWeight: 500,
    zIndex: 5,
  }}>
    <svg width="22" height="22" viewBox="0 0 22 22" style={{ display: 'block' }}>
      <path d="M2 19 L8 7 L11 13 L14 9 L20 19 Z" fill="currentColor" />
    </svg>
    <span>Salty Mountain</span>
  </div>
);

const ShopBadge = ({ light = false, label = 'Shop on Etsy' }) => (
  <div style={{
    position: 'absolute', bottom: 36, right: 36,
    background: light ? 'rgba(255,255,255,.95)' : ink,
    color: light ? ink : paper,
    padding: '18px 26px',
    borderRadius: 999,
    fontSize: 22, fontWeight: 600, letterSpacing: '0.04em',
    display: 'flex', alignItems: 'center', gap: 12,
    boxShadow: '0 6px 22px rgba(0,0,0,.18)',
    zIndex: 5,
  }}>
    <span>{label}</span>
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M3 9h11M9 4l5 5-5 5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  </div>
);

const ColoradoOutline = ({ size = 90, dot, color = ink }) => (
  <svg width={size} height={size * 0.78} viewBox="0 0 100 78" style={{ display: 'block' }}>
    <rect x="3" y="3" width="94" height="72" fill="none" stroke={color} strokeWidth="2.5" />
    {dot && <circle cx={dot[0]} cy={dot[1]} r="6" fill={color} />}
    {dot && <circle cx={dot[0]} cy={dot[1]} r="13" fill="none" stroke={color} strokeWidth="1.5" opacity="0.5" />}
  </svg>
);

// Framed print w/ image-slot inside.
const FramedSlot = ({ slotId, caption, w = 220, h = 290, placeholder }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
    <div style={{
      width: w, height: h,
      background: '#fff',
      padding: 14,
      boxShadow: '0 8px 22px rgba(0,0,0,.12), 0 1px 0 rgba(0,0,0,.05)',
      boxSizing: 'border-box',
    }}>
      <MtnSlot id={slotId} placeholder={placeholder || 'Drop photo'}
        style={{ width: '100%', height: '100%', display: 'block' }} />
    </div>
    {caption && <div style={{
      fontFamily: '"JetBrains Mono", monospace',
      fontSize: 13, letterSpacing: '0.18em', textTransform: 'uppercase',
      color: stone,
    }}>{caption}</div>}
  </div>
);

// =============================================================================
// PIN 01 — Single Peak Hero
// =============================================================================
function Pin01_Hero() {
  return (
    <div style={pinShell}>
      <MtnSlot
        id="shared-hero-mountain"
        placeholder="Drop summit photo (fills pins 1, 2, 5, 6, 7, 8, 10)"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
      />
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 220,
        background: 'linear-gradient(180deg, rgba(0,0,0,.55), rgba(0,0,0,0))',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: 620,
        background: 'linear-gradient(180deg, rgba(0,0,0,0), rgba(0,0,0,.78))',
        pointerEvents: 'none',
      }} />
      <Wordmark light />
      <div style={{ position: 'absolute', left: 56, right: 56, bottom: 160, color: '#fff' }}>
        <div style={{
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: 18, letterSpacing: '0.32em', textTransform: 'uppercase',
          opacity: 0.85, marginBottom: 22,
        }}>
          Sawatch Range · No. 14
        </div>
        <div style={{
          fontFamily: '"Cormorant Garamond", "Times New Roman", serif',
          fontSize: 138, lineHeight: 0.92, fontWeight: 500,
          letterSpacing: '-0.02em',
        }}>
          Mount<br />Elbert
        </div>
        <div style={{
          marginTop: 28,
          display: 'flex', gap: 24, alignItems: 'center',
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: 22, letterSpacing: '0.12em',
          opacity: 0.92,
        }}>
          <span>14,440 FT</span>
          <span style={{ opacity: 0.5 }}>·</span>
          <span>VIEW NW</span>
          <span style={{ opacity: 0.5 }}>·</span>
          <span>SUNRISE</span>
        </div>
      </div>
      <ShopBadge light />
    </div>
  );
}

// =============================================================================
// PIN 02 — In-Room Mockup (real bedroom photo, art replaces existing frame)
// =============================================================================
function Pin02_Lifestyle() {
  // Bedroom photo is 612×408 (3:2). When we render it at the pin's 1000px width
  // it scales to 1000×667. We anchor it inside a 1500-tall canvas with a
  // headline band above. Frame overlay coordinates are computed relative to
  // the displayed photo (1000×667) using the percentages measured off the source:
  //   art frame in photo: x ≈ 37%-63%, y ≈ 28%-50%
  // So in displayed pixels: x ≈ 370-630, y ≈ 187-334 — centered over the bed.
  // The photo is positioned starting at top: 460 inside the 1500 canvas, so
  // overlay top offset is 460 + 187 = 647, height ≈ 147, width ≈ 260.
  // We expand the slot slightly to give visual presence and feel believable.
  const photoTop = 420;
  const photoH = 1000 * (408 / 612); // 666.67
  return (
    <div style={{ ...pinShell, background: '#f6f3ee' }}>
      {/* Headline band above the room */}
      <Wordmark />

      <div style={{
        position: 'absolute', top: 130, left: 56, right: 56, textAlign: 'center',
      }}>
        <div style={{
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: 18, letterSpacing: '0.3em', textTransform: 'uppercase',
          color: stone, marginBottom: 16,
        }}>See it on the wall</div>
        <div style={{
          fontFamily: '"Cormorant Garamond", serif',
          fontSize: 88, fontWeight: 500, lineHeight: 1, letterSpacing: '-0.02em',
        }}>Quiet walls.<br /><span style={{ fontStyle: 'italic' }}>Loud mountains.</span></div>
      </div>

      {/* Bedroom photo */}
      <img src="assets/bedroom.jpg" style={{
        position: 'absolute', left: 0, top: photoTop,
        width: PIN_W, height: photoH, objectFit: 'cover',
        display: 'block',
      }} />

      {/* Image slot positioned exactly over the existing wall art */}
      <div style={{
        position: 'absolute',
        left: 360, top: photoTop + 178,
        width: 280, height: 168,
        // Subtle frame styling — black mat to match the existing frame in the photo
        background: '#1a1816',
        padding: 6, boxSizing: 'border-box',
        boxShadow: '0 8px 18px rgba(0,0,0,.18)',
      }}>
        <div style={{
          background: '#fff', padding: 10, height: '100%', boxSizing: 'border-box',
        }}>
          <MtnSlot
            id="shared-hero-mountain"
            placeholder="Drop print"
            style={{ width: '100%', height: '100%', display: 'block' }}
          />
        </div>
      </div>

      {/* Bottom caption */}
      <div style={{
        position: 'absolute', left: 56, right: 56, bottom: 130,
        textAlign: 'center',
        fontFamily: '"JetBrains Mono", monospace',
        fontSize: 16, letterSpacing: '0.28em', textTransform: 'uppercase',
        color: stone,
      }}>
        Printable Wall Art · Colorado 14ers
      </div>

      <ShopBadge />
    </div>
  );
}

// =============================================================================
// PIN 03 — Triptych
// =============================================================================
function Pin03_Triptych() {
  return (
    <div style={{ ...pinShell, background: '#efeae1' }}>
      <Wordmark />
      <div style={{ position: 'absolute', top: 130, left: 56, right: 56, textAlign: 'center' }}>
        <div style={{
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: 18, letterSpacing: '0.3em', textTransform: 'uppercase',
          color: stone, marginBottom: 18,
        }}>
          Gallery Set · Three Prints
        </div>
        <div style={{
          fontFamily: '"Cormorant Garamond", serif',
          fontSize: 92, lineHeight: 1, fontWeight: 500, letterSpacing: '-0.02em',
        }}>
          The Sawatch<br />Triptych
        </div>
      </div>

      <div style={{
        position: 'absolute', left: 0, right: 0, top: 580,
        display: 'flex', justifyContent: 'center', gap: 22,
      }}>
        <div style={{ transform: 'rotate(-3deg) translateY(20px)' }}>
          <FramedSlot slotId="pin03-a" caption="Elbert · 14,440" w={250} h={340} placeholder="Drop Elbert" />
        </div>
        <div style={{ transform: 'translateY(-6px)' }}>
          <FramedSlot slotId="pin03-b" caption="Massive · 14,428" w={260} h={350} placeholder="Drop Massive" />
        </div>
        <div style={{ transform: 'rotate(3deg) translateY(20px)' }}>
          <FramedSlot slotId="pin03-c" caption="Harvard · 14,421" w={250} h={340} placeholder="Drop Harvard" />
        </div>
      </div>

      <div style={{
        position: 'absolute', left: 56, right: 56, bottom: 130,
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
      }}>
        <div>
          <div style={{
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: 16, letterSpacing: '0.22em', textTransform: 'uppercase',
            color: fog,
          }}>Set of Three · Digital Download</div>
          <div style={{
            marginTop: 8,
            fontFamily: '"Cormorant Garamond", serif',
            fontSize: 56, fontWeight: 500, letterSpacing: '-0.01em',
          }}>$14</div>
        </div>
      </div>

      <ShopBadge />
    </div>
  );
}

// =============================================================================
// PIN 04 — 6-Print Grid
// =============================================================================
function Pin04_SixGrid() {
  const peaks = [
    { id: 'pin04-elbert', name: 'Elbert', el: '14,440' },
    { id: 'pin04-massive', name: 'Massive', el: '14,428' },
    { id: 'pin04-harvard', name: 'Harvard', el: '14,421' },
    { id: 'pin04-laplata', name: 'La Plata', el: '14,343' },
    { id: 'pin04-antero', name: 'Antero', el: '14,276' },
    { id: 'pin04-princeton', name: 'Princeton', el: '14,204' },
  ];
  return (
    <div style={{ ...pinShell, background: ink, color: paper }}>
      <Wordmark light />
      <div style={{
        position: 'absolute', top: 130, left: 56, right: 56, textAlign: 'center', color: paper,
      }}>
        <div style={{
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: 18, letterSpacing: '0.3em', textTransform: 'uppercase',
          opacity: 0.7, marginBottom: 18,
        }}>
          Six-Print Collection
        </div>
        <div style={{
          fontFamily: '"Cormorant Garamond", serif',
          fontSize: 96, lineHeight: 1, fontWeight: 500, letterSpacing: '-0.02em',
        }}>
          Sawatch<br />Range
        </div>
      </div>

      <div style={{
        position: 'absolute', top: 560, left: 70, right: 70,
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 22,
      }}>
        {peaks.map((p) => (
          <div key={p.id} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{
              aspectRatio: '2 / 3', background: '#fff', padding: 10, boxSizing: 'border-box',
              boxShadow: '0 10px 22px rgba(0,0,0,.4)',
            }}>
              <MtnSlot id={p.id} placeholder={`Drop ${p.name}`}
                style={{ width: '100%', height: '100%', display: 'block' }} />
            </div>
            <div style={{
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: 13, letterSpacing: '0.16em', textTransform: 'uppercase',
              color: paper, opacity: 0.75, textAlign: 'center',
            }}>
              {p.name} · {p.el}
            </div>
          </div>
        ))}
      </div>

      <div style={{
        position: 'absolute', bottom: 36, left: 36,
        display: 'flex', alignItems: 'baseline', gap: 14, color: paper,
      }}>
        <span style={{
          fontFamily: '"Cormorant Garamond", serif',
          fontSize: 56, fontWeight: 500,
        }}>$22</span>
        <span style={{
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: 14, letterSpacing: '0.18em', textTransform: 'uppercase',
          opacity: 0.6,
        }}>set of six</span>
      </div>

      <ShopBadge light />
    </div>
  );
}

// =============================================================================
// PIN 05 — Before/After
// Note: top "color" slot is left without B&W filter so user sees their original.
// =============================================================================
function Pin05_BeforeAfter() {
  const colorRef = React.useRef(null);
  React.useEffect(() => {
    if (!colorRef.current) return;
    const root = colorRef.current.shadowRoot;
    if (!root) return;
    if (!root.getElementById('__color-style')) {
      const s = document.createElement('style');
      s.id = '__color-style';
      // No grayscale: this is the "photo" panel.
      s.textContent = 'img, .img, [part="img"], div { filter: contrast(1.02) saturate(1.05); }';
      root.appendChild(s);
    }
  });
  return (
    <div style={{ ...pinShell, background: paper }}>
      <Wordmark />

      <div style={{
        position: 'absolute', left: 56, right: 56, top: 130, height: 540,
        boxShadow: '0 14px 28px rgba(0,0,0,.16)',
      }}>
        <image-slot ref={colorRef}
          id="pin05-color"
          placeholder="Drop original color photo"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />
        <div style={{
          position: 'absolute', top: 18, left: 22, zIndex: 2,
          background: 'rgba(255,255,255,.92)', padding: '8px 14px',
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: 14, letterSpacing: '0.22em', textTransform: 'uppercase',
        }}>The Photo</div>
      </div>

      <div style={{
        position: 'absolute', left: '50%', top: 678, transform: 'translateX(-50%)',
        fontFamily: '"Cormorant Garamond", serif',
        fontSize: 44, color: stone,
        display: 'flex', alignItems: 'center', gap: 18,
      }}>
        <div style={{ width: 80, height: 1, background: stone }} />
        <span style={{ fontStyle: 'italic' }}>becomes</span>
        <div style={{ width: 80, height: 1, background: stone }} />
      </div>

      <div style={{
        position: 'absolute', left: 56, right: 56, top: 770, height: 540,
        boxShadow: '0 14px 28px rgba(0,0,0,.16)',
      }}>
        <MtnSlot
          id="shared-hero-mountain"
          placeholder="Drop same photo (renders B&W)"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
        />
        <div style={{
          position: 'absolute', top: 18, left: 22, zIndex: 2,
          background: ink, color: paper, padding: '8px 14px',
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: 14, letterSpacing: '0.22em', textTransform: 'uppercase',
        }}>The Print</div>
      </div>

      <div style={{
        position: 'absolute', left: 56, right: 56, bottom: 130,
        fontFamily: '"Cormorant Garamond", serif',
        fontSize: 44, lineHeight: 1.1, fontWeight: 500, fontStyle: 'italic',
      }}>
        Summit photographs, restored<br />to gallery black &amp; white.
      </div>

      <ShopBadge />
    </div>
  );
}

// =============================================================================
// PIN 06 — Editorial Typographic
// =============================================================================
function Pin06_Editorial() {
  return (
    <div style={{ ...pinShell, background: paper }}>
      <Wordmark />

      <div style={{
        position: 'absolute', top: 170, left: 40, right: 40,
        fontFamily: '"Cormorant Garamond", serif',
        fontWeight: 500, letterSpacing: '-0.04em',
        fontSize: 280, lineHeight: 0.86, color: ink,
      }}>
        Mount<br />Massive
      </div>

      <div style={{
        position: 'absolute', right: 60, top: 740,
        width: 380, height: 510,
        boxShadow: '0 18px 36px rgba(0,0,0,.22)',
      }}>
        <MtnSlot
          id="shared-hero-mountain"
          placeholder="Drop Mt. Massive"
          style={{ width: '100%', height: '100%', display: 'block' }}
        />
      </div>

      <div style={{
        position: 'absolute', left: 60, top: 780, width: 420,
        fontFamily: '"JetBrains Mono", monospace',
        fontSize: 18, letterSpacing: '0.12em', color: stone,
        lineHeight: 1.7,
      }}>
        <div style={{ borderTop: `1px solid ${ink}`, paddingTop: 20, marginBottom: 20 }} />
        <div><span style={{ opacity: 0.55 }}>RANGE</span><br />Sawatch</div>
        <div style={{ marginTop: 14 }}><span style={{ opacity: 0.55 }}>ELEVATION</span><br />14,428 ft / 4,398 m</div>
        <div style={{ marginTop: 14 }}><span style={{ opacity: 0.55 }}>VIEW</span><br />Northeast · Sunrise</div>
        <div style={{ marginTop: 14 }}><span style={{ opacity: 0.55 }}>RANK</span><br />2nd highest in Colorado</div>
      </div>

      <div style={{
        position: 'absolute', left: 60, bottom: 50,
        fontFamily: '"Cormorant Garamond", serif',
        fontStyle: 'italic', fontSize: 32, color: stone,
      }}>
        №&nbsp;06 of 58
      </div>

      <ShopBadge />
    </div>
  );
}

// =============================================================================
// PIN 07 — Map Locator
// =============================================================================
function Pin07_MapLocator() {
  return (
    <div style={{ ...pinShell, background: '#efeae1' }}>
      <Wordmark />

      <div style={{
        position: 'absolute', top: 130, left: 56, right: 56,
        display: 'flex', alignItems: 'center', gap: 28,
      }}>
        <ColoradoOutline size={130} dot={[42, 38]} />
        <div>
          <div style={{
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: 16, letterSpacing: '0.28em', textTransform: 'uppercase',
            color: stone, marginBottom: 6,
          }}>40.0780° N · 105.5552° W</div>
          <div style={{
            fontFamily: '"Cormorant Garamond", serif',
            fontSize: 56, fontWeight: 500, letterSpacing: '-0.02em', lineHeight: 1,
          }}>Longs Peak</div>
        </div>
      </div>

      <div style={{
        position: 'absolute', top: 360, left: 100, right: 100,
        background: '#fff', padding: 28, boxSizing: 'border-box',
        boxShadow: '0 18px 40px rgba(0,0,0,.18)',
      }}>
        <div style={{ width: '100%', aspectRatio: '4 / 5' }}>
          <MtnSlot
            id="shared-hero-mountain"
            placeholder="Drop Longs Peak"
            style={{ width: '100%', height: '100%', display: 'block' }}
          />
        </div>
        <div style={{
          marginTop: 18, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: 13, letterSpacing: '0.2em', textTransform: 'uppercase',
          color: stone,
        }}>
          <span>Front Range</span>
          <span style={{
            fontFamily: '"Cormorant Garamond", serif',
            fontStyle: 'italic',
            fontSize: 22, letterSpacing: 0, textTransform: 'none', opacity: 0.7,
          }}>view from the keyhole</span>
          <span>14,259 FT</span>
        </div>
      </div>

      <div style={{
        position: 'absolute', left: 56, right: 56, bottom: 130,
        fontFamily: '"Cormorant Garamond", serif',
        fontSize: 38, lineHeight: 1.2, fontWeight: 500, fontStyle: 'italic',
        color: stone,
      }}>
        Every print, a real Colorado summit.
      </div>

      <ShopBadge />
    </div>
  );
}

// =============================================================================
// PIN 08 — Elevation Hook
// =============================================================================
function Pin08_Elevation() {
  return (
    <div style={pinShell}>
      <MtnSlot
        id="shared-hero-mountain"
        placeholder="Drop summit photo"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
      />
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'linear-gradient(180deg, rgba(0,0,0,.35) 0%, rgba(0,0,0,0) 35%, rgba(0,0,0,0) 55%, rgba(0,0,0,.6) 100%)',
      }} />
      <Wordmark light />

      <div style={{
        position: 'absolute', top: '38%', left: 0, right: 0,
        textAlign: 'center', color: '#fff',
      }}>
        <div style={{
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: 22, letterSpacing: '0.5em', textTransform: 'uppercase',
          opacity: 0.85,
        }}>The view from</div>
        <div style={{
          marginTop: 14,
          fontFamily: '"Cormorant Garamond", serif',
          fontSize: 280, lineHeight: 0.9, fontWeight: 400, letterSpacing: '-0.04em',
        }}>14,433<span style={{ fontSize: 100, verticalAlign: 'top', marginLeft: 8 }}>ft</span></div>
        <div style={{
          marginTop: 6,
          fontFamily: '"Cormorant Garamond", serif',
          fontStyle: 'italic', fontSize: 56, fontWeight: 400,
          opacity: 0.92,
        }}>Mount Elbert · sunrise</div>
      </div>

      <div style={{
        position: 'absolute', left: 56, bottom: 48, color: '#fff',
        fontFamily: '"JetBrains Mono", monospace',
        fontSize: 16, letterSpacing: '0.24em', textTransform: 'uppercase',
        opacity: 0.85,
        maxWidth: 380,
        lineHeight: 1.7,
      }}>
        Printable wall art<br />Colorado 14ers · B&amp;W
      </div>

      <ShopBadge light />
    </div>
  );
}

// =============================================================================
// PIN 09 — Carousel Tease
// =============================================================================
function Pin09_Carousel() {
  const cards = [
    { id: 'pin09-bierstadt', x: 60, rot: -8, z: 1, cap: 'Bierstadt' },
    { id: 'pin09-evans', x: 240, rot: -2, z: 2, cap: 'Evans' },
    { id: 'pin09-longs', x: 420, rot: 4, z: 3, cap: 'Longs' },
    { id: 'pin09-pikes', x: 600, rot: 9, z: 2, cap: 'Pikes' },
  ];
  return (
    <div style={{ ...pinShell, background: '#1a1815', color: paper }}>
      <Wordmark light />

      <div style={{ position: 'absolute', top: 140, left: 56, right: 56 }}>
        <div style={{
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: 18, letterSpacing: '0.3em', textTransform: 'uppercase',
          opacity: 0.7, marginBottom: 18,
        }}>Front Range · 6 Peaks</div>
        <div style={{
          fontFamily: '"Cormorant Garamond", serif',
          fontSize: 92, lineHeight: 0.96, fontWeight: 500, letterSpacing: '-0.02em',
        }}>Swipe through<br />the range.</div>
      </div>

      <div style={{ position: 'absolute', top: 560, left: 0, right: 0, height: 700 }}>
        {cards.map((c) => (
          <div key={c.id} style={{
            position: 'absolute', left: c.x, top: 30 + Math.abs(c.rot) * 6,
            width: 360, height: 480,
            background: '#fff', padding: 16, boxSizing: 'border-box',
            boxShadow: '0 22px 40px rgba(0,0,0,.5)',
            transform: `rotate(${c.rot}deg)`,
            zIndex: c.z,
          }}>
            <div style={{ width: '100%', height: '88%' }}>
              <MtnSlot id={c.id} placeholder={`Drop ${c.cap}`}
                style={{ width: '100%', height: '100%', display: 'block' }} />
            </div>
            <div style={{
              marginTop: 8, textAlign: 'center',
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: 13, letterSpacing: '0.18em', textTransform: 'uppercase',
              color: stone,
            }}>{c.cap}</div>
          </div>
        ))}
      </div>

      <div style={{
        position: 'absolute', left: 56, bottom: 50,
        display: 'flex', alignItems: 'center', gap: 14,
        fontFamily: '"JetBrains Mono", monospace',
        fontSize: 16, letterSpacing: '0.28em', textTransform: 'uppercase',
        opacity: 0.85,
      }}>
        <span>See all 6 →</span>
      </div>

      <ShopBadge light />
    </div>
  );
}

// =============================================================================
// PIN 10 — Honesty / Process Manifesto
// =============================================================================
function Pin10_Honesty() {
  return (
    <div style={{ ...pinShell, background: paper }}>
      <Wordmark />

      <div style={{
        position: 'absolute', top: 120, right: 60,
        width: 240, height: 320,
        boxShadow: '0 14px 28px rgba(0,0,0,.18)',
      }}>
        <MtnSlot
          id="shared-hero-mountain"
          placeholder="Drop summit"
          style={{ width: '100%', height: '100%', display: 'block' }}
        />
      </div>

      <div style={{ position: 'absolute', left: 60, top: 510, right: 60 }}>
        <div style={{
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: 18, letterSpacing: '0.3em', textTransform: 'uppercase',
          color: stone, marginBottom: 24,
        }}>How we make these</div>
        <div style={{
          fontFamily: '"Cormorant Garamond", serif',
          fontSize: 76, lineHeight: 1.04, fontWeight: 500, letterSpacing: '-0.02em',
        }}>
          AI-rendered.<br />
          Hand-curated.<br />
          <span style={{ fontStyle: 'italic' }}>Gallery print.</span>
        </div>
      </div>

      <div style={{
        position: 'absolute', left: 60, right: 60, bottom: 200,
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24,
        fontFamily: '"JetBrains Mono", monospace',
        fontSize: 15, letterSpacing: '0.05em', lineHeight: 1.55, color: stone,
      }}>
        {[
          { n: '01', t: 'Render', d: 'Compose the summit view from real reference imagery.' },
          { n: '02', t: 'Curate', d: 'Geographic accuracy checked. Artifacts hunted down.' },
          { n: '03', t: 'Tone', d: 'Color-corrected to neutral B&W for gallery print.' },
        ].map((s, i) => (
          <div key={i} style={{ borderTop: `1.5px solid ${ink}`, paddingTop: 14 }}>
            <div style={{
              fontFamily: '"Cormorant Garamond", serif',
              fontSize: 32, fontStyle: 'italic',
              marginBottom: 6,
            }}>{s.n}</div>
            <div style={{
              fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase',
              fontSize: 13, marginBottom: 8,
            }}>{s.t}</div>
            <div style={{ opacity: 0.75 }}>{s.d}</div>
          </div>
        ))}
      </div>

      <ShopBadge />
    </div>
  );
}

// =============================================================================
// Stage wrapper
// =============================================================================
function Pin({ children, scale = 360 / PIN_W }) {
  return (
    <div style={{
      width: PIN_W * scale, height: PIN_H * scale,
      position: 'relative', overflow: 'hidden', background: '#fff',
    }}>
      <div style={{
        transform: `scale(${scale})`, transformOrigin: 'top left',
        width: PIN_W, height: PIN_H,
      }}>{children}</div>
    </div>
  );
}

Object.assign(window, {
  Pin01_Hero, Pin02_Lifestyle, Pin03_Triptych, Pin04_SixGrid,
  Pin05_BeforeAfter, Pin06_Editorial, Pin07_MapLocator,
  Pin08_Elevation, Pin09_Carousel, Pin10_Honesty,
  Pin, PIN_W, PIN_H,
});
