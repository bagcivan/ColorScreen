document.addEventListener('DOMContentLoaded', function () {

    const FFT_SIZE = 1024;
    const MULTIPLIER = 2;

    // Ekranın aktif kalmasını sağlama
    async function activateWakeLock() {
        let wakeLock = null;

        try {
            if ('WakeLock' in window && 'request' in window.WakeLock) {
                const controller = new AbortController();
                await window.WakeLock.request('screen', { signal: controller.signal });
            } else if ('wakeLock' in navigator && 'request' in navigator.wakeLock) {
                wakeLock = await navigator.wakeLock.request('screen');
                wakeLock.addEventListener('release', () => {
                    console.log('Wake Lock was released');
                });
            } else {
                throw new Error('Wake Lock API not supported.');
            }
            console.log('Wake Lock is active');
        } catch (e) {
            console.error(`${e.name}, ${e.message}`);
        }
    }

    // Ses analizi ve arkaplan rengini ayarlama
    function analyzeAudio() {
        navigator.mediaDevices.getUserMedia({ audio: true, video: false })
            .then(stream => {
                const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                const analyser = audioContext.createAnalyser();
                analyser.fftSize = FFT_SIZE;
                const bufferLength = analyser.frequencyBinCount;
                const dataArray = new Uint8Array(bufferLength);
                const source = audioContext.createMediaStreamSource(stream);
                source.connect(analyser);

                function getAverageVolume(array) {
                    return array.reduce((acc, value) => acc + value, 0) / array.length;
                }

                function updateVisualizer() {
                    requestAnimationFrame(updateVisualizer);

                    analyser.getByteFrequencyData(dataArray);

                    const bass = getAverageVolume(dataArray.slice(0, bufferLength / 3)) * MULTIPLIER;
                    const mid = getAverageVolume(dataArray.slice(bufferLength / 3, (bufferLength * 2) / 3)) * MULTIPLIER;
                    const treble = getAverageVolume(dataArray.slice((bufferLength * 2) / 3, bufferLength)) * MULTIPLIER;

                    document.body.style.backgroundColor = `rgb(${Math.min(255, bass)}, ${Math.min(255, mid)}, ${Math.min(255, treble)})`;
                }

                updateVisualizer();
            })
            .catch(err => {
                console.error('Mikrofon erişimi reddedildi:', err);
            });
    }

    activateWakeLock();
    analyzeAudio();
});
