document.addEventListener('DOMContentLoaded', function() {
    navigator.mediaDevices.getUserMedia({ audio: true, video: false })
    .then(stream => {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 1024;  // FFT boyutunu artırma
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const source = audioContext.createMediaStreamSource(stream);
        source.connect(analyser);

        function getAverageVolume(array) {
            const values = array.reduce((acc, value) => acc + value, 0);
            return values / array.length;
        }

        function update() {
            requestAnimationFrame(update);

            analyser.getByteFrequencyData(dataArray);

            // Bas, orta ve tiz frekans aralıklarını tanımlama
            const bassArray = dataArray.slice(0, bufferLength / 3);
            const midArray = dataArray.slice(bufferLength / 3, (bufferLength * 2) / 3);
            const trebleArray = dataArray.slice((bufferLength * 2) / 3, bufferLength);

            const bass = getAverageVolume(bassArray) * 2;  // Hassasiyeti artırma
            const mid = getAverageVolume(midArray) * 2;    // Hassasiyeti artırma
            const treble = getAverageVolume(trebleArray) * 2;  // Hassasiyeti artırma

            const red = Math.min(255, bass);  
            const green = Math.min(255, mid);
            const blue = Math.min(255, treble);

            document.body.style.backgroundColor = `rgb(${red}, ${green}, ${blue})`;
        }

        update();
    })
    .catch(err => {
        console.error('Mikrofon erişimi reddedildi:', err);
    });
});