const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const fileName = document.getElementById('fileName');
const patchBtn = document.getElementById('patchBtn');
const resetBtn = document.getElementById('resetBtn');
const logBox = document.getElementById('logBox');
const progressBar = document.getElementById('progressBar');
const downloadSection = document.getElementById('downloadSection');
const downloadBtn = document.getElementById('downloadBtn');

let selectedFile = null;

// ড্রপ / ক্লিক ইভেন্ট
dropZone.addEventListener('click', () => fileInput.click());
dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.style.borderColor = '#66ffe0';
});
dropZone.addEventListener('dragleave', () => {
    dropZone.style.borderColor = '#00ffc8';
});
dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.style.borderColor = '#00ffc8';
    if (e.dataTransfer.files.length) {
        handleFile(e.dataTransfer.files[0]);
    }
});
fileInput.addEventListener('change', (e) => {
    if (e.target.files.length) {
        handleFile(e.target.files[0]);
    }
});

function handleFile(file) {
    if (!file.name.endsWith('.apk')) {
        alert('Please select an APK file.');
        return;
    }
    selectedFile = file;
    fileName.textContent = file.name;
    logBox.innerHTML += `\n> File loaded: ${file.name}`;
    logBox.scrollTop = logBox.scrollHeight;
}

// প্যাচ বাটন
patchBtn.addEventListener('click', async () => {
    if (!selectedFile) {
        alert('First upload an APK file.');
        return;
    }

    const sslBypass = document.getElementById('sslBypass').checked;
    const vpnBypass = document.getElementById('vpnBypass').checked;

    // UI লক
    patchBtn.disabled = true;
    progressBar.style.width = '0%';
    downloadSection.style.display = 'none';
    logBox.innerHTML += '\n> Starting patch process...';

    // ফর্মডেটা তৈরি
    const formData = new FormData();
    formData.append('apkFile', selectedFile);
    formData.append('sslBypass', sslBypass);
    formData.append('vpnBypass', vpnBypass);

    try {
        // প্রোগ্রেস সিমুলেট (শুধু UI)
        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 10;
            if (progress >= 90) clearInterval(interval);
            progressBar.style.width = Math.min(progress, 90) + '%';
        }, 300);

        const response = await fetch('/api/patch', {
            method: 'POST',
            body: formData
        });

        clearInterval(interval);
        progressBar.style.width = '100%';

        const data = await response.json();

        if (data.success) {
            logBox.innerHTML += '\n' + data.logs.map(l => '> ' + l).join('\n');
            logBox.innerHTML += '\n> ✅ Patch successful!';
            if (data.downloadUrl && data.downloadUrl !== '#') {
                downloadBtn.href = data.downloadUrl;
                downloadSection.style.display = 'block';
            } else {
                // ডেমো: ডামি ডাউনলোড
                downloadSection.style.display = 'block';
                downloadBtn.href = '#';
                downloadBtn.textContent = '⬇ Download (Demo)';
                logBox.innerHTML += '\n> ℹ️ Demo: 실제 APK ডাউনলোড Vercel এ সম্ভব নয়।';
            }
        } else {
            logBox.innerHTML += `\n> ❌ Error: ${data.error || 'Unknown error'}`;
        }
    } catch (err) {
        logBox.innerHTML += `\n> ❌ Request failed: ${err.message}`;
    }

    patchBtn.disabled = false;
    logBox.scrollTop = logBox.scrollHeight;
});

// রিসেট বাটন
resetBtn.addEventListener('click', () => {
    selectedFile = null;
    fileInput.value = '';
    fileName.textContent = 'No file selected';
    logBox.innerHTML = '> Ready to hack...\n> Upload an APK and hit Start.';
    progressBar.style.width = '0%';
    downloadSection.style.display = 'none';
    patchBtn.disabled = false;
});
