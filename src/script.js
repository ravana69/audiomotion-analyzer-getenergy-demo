/**
 * for documentation and more demos,
 * visit https://audiomotion.dev
 */

// load module from Skypack CDN
import AudioMotionAnalyzer from 'https://cdn.skypack.dev/audiomotion-analyzer?min';

// audio source
const audioEl = document.getElementById('audio');

// instantiate analyzer
const audioMotion = new AudioMotionAnalyzer(
  document.getElementById('container'),
  {
    source: audioEl,
    showBgColor: false,
    onCanvasDraw: energyMeters
  }
);

// display module version
document.getElementById('version').innerText = `v${AudioMotionAnalyzer.version}`;

// play stream
document.getElementById('live').addEventListener( 'click', () => {
  audioEl.src = 'https://icecast2.ufpel.edu.br/live';
  audioEl.play();
});

// file upload
document.getElementById('upload').addEventListener( 'change', e => {
	const fileBlob = e.target.files[0];

	if ( fileBlob ) {
		audioEl.src = URL.createObjectURL( fileBlob );
		audioEl.play();
	}
});

// callback function
function energyMeters() {
  const canvas     = audioMotion.canvas,
        ctx        = audioMotion.canvasCtx,
        pixelRatio = audioMotion.pixelRatio,
        baseSize   = Math.max( 20 * pixelRatio, canvas.height / 27 | 0 ),
        centerX    = canvas.width >> 1,
        centerY    = canvas.height >> 1;

  // helper function
  const drawLight = ( posX, color, alpha ) => {

    const width       = 50 * pixelRatio,
          halfWidth   = width >> 1,
          doubleWidth = width << 1;

    const grad = ctx.createLinearGradient( 0, 0, 0, canvas.height );
    grad.addColorStop( 0, color );
    grad.addColorStop( .75, `${color}0` );

    ctx.beginPath();
    ctx.moveTo( posX - halfWidth, 0 );
    ctx.lineTo( posX - doubleWidth, canvas.height );
    ctx.lineTo( posX + doubleWidth, canvas.height );
    ctx.lineTo( posX + halfWidth, 0 );

    ctx.save();
    ctx.fillStyle = grad;
    ctx.shadowColor = color;
    ctx.shadowBlur = 40;
    ctx.globalCompositeOperation = 'screen';
    ctx.globalAlpha = alpha;
    ctx.fill();
    ctx.restore();
  }

  // bass, midrange and treble meters

  ctx.fillStyle = '#fff8';
  ctx.textAlign = 'center';
  const growSize = baseSize * 4;

  const bassEnergy = audioMotion.getEnergy('bass');
  ctx.font = `bold ${ baseSize + growSize * bassEnergy }px sans-serif`;
  ctx.fillText( 'BASS', canvas.width * .15, centerY );
  drawLight( canvas.width * .15, '#f00', bassEnergy );

  drawLight( canvas.width * .325, '#f80', audioMotion.getEnergy('lowMid') );

  const midEnergy = audioMotion.getEnergy('mid');
  ctx.font = `bold ${ baseSize + growSize * midEnergy }px sans-serif`;
  ctx.fillText( 'MIDRANGE', centerX, centerY );
  drawLight( centerX, '#ff0', midEnergy );

  drawLight( canvas.width * .675, '#0f0', audioMotion.getEnergy('highMid') );

  const trebleEnergy = audioMotion.getEnergy('treble');
  ctx.font = `bold ${ baseSize + growSize * trebleEnergy }px sans-serif`;
  ctx.fillText( 'TREBLE', canvas.width * .85, centerY );
  drawLight( canvas.width * .85, '#0ff', trebleEnergy );
}

