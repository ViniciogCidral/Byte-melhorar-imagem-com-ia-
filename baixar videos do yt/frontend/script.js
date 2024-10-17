import config from './config.js';
console.log('Config importado:', config);

document.addEventListener('DOMContentLoaded', () => {
    const imageInput = document.getElementById('image-input');
    const enhancementOptions = document.getElementById('enhancement-options');
    const enhanceButton = document.getElementById('enhance-button');
    const originalImage = document.getElementById('original-image');
    const enhancedImage = document.getElementById('enhanced-image');

    let selectedFile = null;

    imageInput.addEventListener('change', (event) => {
        selectedFile = event.target.files[0];
        if (selectedFile) {
            const reader = new FileReader();
            reader.onload = (e) => {
                originalImage.src = e.target.result;
            };
            reader.readAsDataURL(selectedFile);
        }
    });

    enhanceButton.addEventListener('click', async () => {
        if (!selectedFile) {
            alert('Por favor, selecione uma imagem primeiro.');
            return;
        }

        const selectedOption = enhancementOptions.value;
        try {
            enhanceButton.disabled = true;
            enhanceButton.textContent = 'Processando...';

            if (!await checkImageLimitations(selectedFile)) {
                return;
            }

            const enhancedImageUrl = await enhanceImage(selectedFile, selectedOption);
            enhancedImage.src = enhancedImageUrl.src;
            alert('Imagem melhorada com sucesso!');
        } catch (error) {
            console.error('Erro ao melhorar a imagem:', error);
            alert(`Ocorreu um erro ao melhorar a imagem: ${error.message}`);
        } finally {
            enhanceButton.disabled = false;
            enhanceButton.textContent = 'Melhorar Imagem';
        }
    });

    async function checkImageLimitations(file) {
        if (file.size > 25 * 1024 * 1024) {
            alert('O tamanho máximo do arquivo é 25MB.');
            return false;
        }

        return new Promise((resolve) => {
            const img = new Image();
            img.onload = function() {
                const width = this.width;
                const height = this.height;

                if (width < 64 || height < 64) {
                    alert('A resolução mínima da imagem é 64x64px.');
                    resolve(false);
                } else if (width > 3000 || height > 3000) {
                    alert('A resolução máxima para upscale 2x é 3000x3000px.');
                    resolve(false);
                } else {
                    resolve(true);
                }
            };
            img.src = URL.createObjectURL(file);
        });
    }

    async function enhanceImage(file, option) {
        const formData = new FormData();
        formData.append('image', file);
        formData.append('scale', option === 'upscale-4x' ? 4 : 2);

        console.log('Enviando requisição para o backend...');
        console.log('Arquivo:', file);
        console.log('Opção:', option);

        try {
            const response = await fetch('http://localhost:3000/v1/upscale', {
                method: 'POST',
                body: formData
            });

            console.log('Resposta recebida do backend:', response);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Erro na resposta:', errorText);
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
            }

            const data = await response.json();
            console.log('Dados da resposta:', data);

            if (!data.image_url) {
                throw new Error('URL da imagem melhorada não encontrada na resposta');
            }

            // Exibir a imagem melhorada
            const enhancedImage = document.getElementById('enhanced-image');
            enhancedImage.src = data.image_url;
            enhancedImage.style.display = 'block';

            return data.image_url;
        } catch (error) {
            console.error('Erro detalhado ao melhorar a imagem:', error);
            console.error('Stack trace:', error.stack);
            throw error;
        }
    }

  
});
