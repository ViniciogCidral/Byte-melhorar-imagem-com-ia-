import pkg from 'follow-redirects';
const { https } = pkg;
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import axios from 'axios';
import FormData from 'form-data';
import { createReadStream, writeFileSync } from 'fs';
import path from 'path';

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(cors({
  origin: 'http://127.0.0.1:5503',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use('/uploads', express.static('uploads'));

const allowedFormats = ['image/jpeg', 'image/png', 'image/webp'];

app.post('/v1/upscale', upload.single('image'), async (req, res) => {
    console.log('Requisição recebida em /v1/upscale');
    
    if (!req.file) {
        console.log('Nenhum arquivo recebido');
        return res.status(400).json({ 
            error: "Nenhuma imagem foi enviada", 
            error_code: "missing_parameter" 
        });
    }

    if (!allowedFormats.includes(req.file.mimetype)) {
        console.log('Formato de imagem não suportado:', req.file.mimetype);
        return res.status(400).json({
            error: "Formato de imagem não suportado",
            error_code: "unsupported_format",
            message: "Por favor, envie uma imagem no formato JPEG, PNG ou WebP."
        });
    }

    console.log('Arquivo recebido:', req.file.filename);
    console.log('Escala selecionada:', req.body.scale);

    const data = new FormData();
    data.append('image', createReadStream(req.file.path));
    data.append('scale', req.body.scale || '2');

    const config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: 'https://api.developer.pixelcut.ai/v1/upscale',
      headers: { 
        'Content-Type': 'multipart/form-data', 
        'Accept': 'image/*, \'image/*\'', 
        'X-API-KEY': 'sk_3f785a7c616d495b98370426037adf08', 
        ...data.getHeaders()
      },
      data : data,
      responseType: 'arraybuffer'
    };

    try {
        console.log('Enviando requisição para a API Pixelcut');
        const response = await axios.request(config);
        console.log('Resposta recebida da API Pixelcut');
        console.log('Status:', response.status);
        console.log('Content-Type:', response.headers['content-type']);

        // Converter o buffer de resposta em uma string JSON
        const responseData = JSON.parse(response.data.toString());
        console.log('Resposta da API Pixel Cut:', JSON.stringify(responseData, null, 2));

        const outputFilename = `upscaled_${req.file.filename}.png`;
        const outputPath = path.join('uploads', outputFilename);
        
        // Baixar a imagem da URL fornecida pela API
        const imageResponse = await axios.get(responseData.result_url, { responseType: 'arraybuffer' });
        writeFileSync(outputPath, imageResponse.data);
        console.log('Imagem upscaled salva em:', outputPath);
        
        const imageUrl = `http://localhost:3000/uploads/${outputFilename}`;
        
        res.json({ 
            status: 'success',
            message: 'Imagem processada com sucesso',
            image_url: imageUrl
        });
    } catch (error) {
        console.error('Erro ao processar a imagem:', error.message);
        res.status(500).json({ error: 'Erro ao processar a imagem', details: error.message });
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
