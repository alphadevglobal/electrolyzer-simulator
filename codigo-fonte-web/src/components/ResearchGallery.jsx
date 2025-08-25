import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Upload, 
  Image as ImageIcon, 
  Trash2, 
  Download, 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  Edit3,
  Save,
  X,
  Info,
  FileImage,
  Grid3X3
} from 'lucide-react';

const ResearchGallery = () => {
  const [images, setImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingImage, setEditingImage] = useState(null);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const fileInputRef = useRef(null);

  // Carregar imagens do localStorage na inicialização
  useEffect(() => {
    const savedImages = localStorage.getItem('research-gallery-images');
    if (savedImages) {
      try {
        setImages(JSON.parse(savedImages));
      } catch (error) {
        console.error('Erro ao carregar imagens:', error);
      }
    }
  }, []);

  // Salvar imagens no localStorage sempre que a lista mudar
  useEffect(() => {
    localStorage.setItem('research-gallery-images', JSON.stringify(images));
  }, [images]);

  // Função para redimensionar imagens mantendo qualidade para gráficos
  const resizeImage = (file, maxWidth = 1200, maxHeight = 800, quality = 0.9) => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Calcular novas dimensões mantendo proporção
        let { width, height } = img;
        const aspectRatio = width / height;
        
        // Para gráficos, preferir largura maior para melhor legibilidade
        if (width > maxWidth || height > maxHeight) {
          if (aspectRatio > 1) {
            // Imagem mais larga que alta (típico para gráficos)
            width = Math.min(width, maxWidth);
            height = width / aspectRatio;
            
            if (height > maxHeight) {
              height = maxHeight;
              width = height * aspectRatio;
            }
          } else {
            // Imagem mais alta que larga
            height = Math.min(height, maxHeight);
            width = height * aspectRatio;
            
            if (width > maxWidth) {
              width = maxWidth;
              height = width / aspectRatio;
            }
          }
        }
        
        // Garantir dimensões mínimas para gráficos
        const minWidth = 400;
        const minHeight = 300;
        
        if (width < minWidth && height < minHeight) {
          if (aspectRatio > 1) {
            width = minWidth;
            height = width / aspectRatio;
          } else {
            height = minHeight;
            width = height * aspectRatio;
          }
        }
        
        canvas.width = Math.round(width);
        canvas.height = Math.round(height);
        
        // Configurar contexto para melhor qualidade
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        
        // Preencher fundo branco para transparências
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Desenhar imagem redimensionada
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        // Converter para base64 com alta qualidade
        const resizedDataUrl = canvas.toDataURL('image/png', quality);
        resolve({
          dataUrl: resizedDataUrl,
          width: canvas.width,
          height: canvas.height,
          originalWidth: img.width,
          originalHeight: img.height
        });
      };
      
      img.onerror = () => {
        console.error('Erro ao carregar imagem');
        resolve(null);
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  // Função para fazer upload de imagens
  const handleImageUpload = async (event) => {
    const files = Array.from(event.target.files);
    
    for (const file of files) {
      if (file.type.startsWith('image/')) {
        try {
          const resizedImage = await resizeImage(file);
          
          const newImage = {
            id: Date.now() + Math.random(),
            title: file.name.replace(/\.[^/.]+$/, ''), // Remove extensão
            description: '',
            dataUrl: resizedImage.dataUrl,
            width: resizedImage.width,
            height: resizedImage.height,
            originalWidth: resizedImage.originalWidth,
            originalHeight: resizedImage.originalHeight,
            fileSize: Math.round(resizedImage.dataUrl.length * 0.75), // Aproximação do tamanho
            uploadDate: new Date().toISOString(),
            originalName: file.name
          };
          
          setImages(prev => [...prev, newImage]);
        } catch (error) {
          console.error('Erro ao processar imagem:', error);
        }
      }
    }
    
    // Limpar input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Função para deletar imagem
  const deleteImage = (imageId) => {
    setImages(prev => prev.filter(img => img.id !== imageId));
    if (selectedImage && selectedImage.id === imageId) {
      setSelectedImage(null);
      setIsModalOpen(false);
    }
  };

  // Função para editar metadados da imagem
  const startEditing = (image) => {
    setEditingImage(image.id);
    setNewTitle(image.title);
    setNewDescription(image.description);
  };

  const saveEdit = () => {
    setImages(prev => prev.map(img => 
      img.id === editingImage 
        ? { ...img, title: newTitle, description: newDescription }
        : img
    ));
    setEditingImage(null);
    setNewTitle('');
    setNewDescription('');
  };

  const cancelEdit = () => {
    setEditingImage(null);
    setNewTitle('');
    setNewDescription('');
  };

  // Função para download de imagem
  const downloadImage = (image) => {
    const link = document.createElement('a');
    link.href = image.dataUrl;
    link.download = `${image.title}.jpg`;
    link.click();
  };

  // Função para exportar todas as imagens como ZIP (simulado)
  const exportAllImages = () => {
    const exportData = {
      exportDate: new Date().toISOString(),
      totalImages: images.length,
      images: images.map(img => ({
        title: img.title,
        description: img.description,
        dimensions: `${img.width}x${img.height}`,
        originalDimensions: `${img.originalWidth}x${img.originalHeight}`,
        uploadDate: img.uploadDate,
        originalName: img.originalName
      }))
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `research_gallery_metadata_${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Função para abrir modal de visualização
  const openImageModal = (image) => {
    setSelectedImage(image);
    setIsModalOpen(true);
  };

  // Função para formatar tamanho do arquivo
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <FileImage className="h-6 w-6 text-blue-600" />
        <h2 className="text-2xl font-bold">Galeria de Pesquisa</h2>
      </div>

      {/* Área de Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload de Gráficos e Imagens
          </CardTitle>
          <CardDescription>
            Faça upload de gráficos, diagramas e imagens relacionadas à pesquisa. 
            As imagens serão automaticamente redimensionadas e otimizadas.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-600 mb-2">
                Clique para selecionar imagens
              </p>
              <p className="text-sm text-gray-500">
                Suporta JPG, PNG, GIF. Múltiplas imagens podem ser selecionadas.
              </p>
            </div>
            
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            
            <div className="flex gap-2">
              <Button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2"
              >
                <Upload className="h-4 w-4" />
                Selecionar Imagens
              </Button>
              
              {images.length > 0 && (
                <Button
                  onClick={exportAllImages}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Exportar Metadados
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estatísticas */}
      {images.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Grid3X3 className="h-5 w-5" />
              Estatísticas da Galeria
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">{images.length}</div>
                <div className="text-sm text-gray-600">Total de Imagens</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {formatFileSize(images.reduce((total, img) => total + img.fileSize, 0))}
                </div>
                <div className="text-sm text-gray-600">Tamanho Total</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">
                  {Math.round(images.reduce((total, img) => total + img.width * img.height, 0) / 1000000)}M
                </div>
                <div className="text-sm text-gray-600">Pixels Totais</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">
                  {images.filter(img => img.uploadDate > new Date(Date.now() - 24*60*60*1000).toISOString()).length}
                </div>
                <div className="text-sm text-gray-600">Hoje</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Grid de Imagens */}
      {images.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Galeria de Imagens ({images.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {images.map((image) => (
                <div key={image.id} className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                  <div 
                    className="relative cursor-pointer"
                    onClick={() => openImageModal(image)}
                  >
                    <img
                      src={image.dataUrl}
                      alt={image.title}
                      className="w-full h-48 object-contain bg-white"
                      style={{
                        imageRendering: 'high-quality'
                      }}
                      onError={(e) => {
                        console.error('Erro ao carregar imagem:', image.title);
                        e.target.style.display = 'none';
                      }}
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all flex items-center justify-center">
                      <ZoomIn className="h-8 w-8 text-white opacity-0 hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                  
                  <div className="p-3">
                    {editingImage === image.id ? (
                      <div className="space-y-2">
                        <Input
                          value={newTitle}
                          onChange={(e) => setNewTitle(e.target.value)}
                          placeholder="Título da imagem"
                          className="text-sm"
                        />
                        <Input
                          value={newDescription}
                          onChange={(e) => setNewDescription(e.target.value)}
                          placeholder="Descrição"
                          className="text-sm"
                        />
                        <div className="flex gap-1">
                          <Button size="sm" onClick={saveEdit} className="flex-1">
                            <Save className="h-3 w-3 mr-1" />
                            Salvar
                          </Button>
                          <Button size="sm" variant="outline" onClick={cancelEdit}>
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <h3 className="font-medium text-sm truncate mb-1">{image.title}</h3>
                        {image.description && (
                          <p className="text-xs text-gray-600 mb-2 line-clamp-2">{image.description}</p>
                        )}
                        <div className="text-xs text-gray-500 mb-2">
                          {image.width} × {image.height} px
                        </div>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => startEditing(image)}
                            className="flex-1"
                          >
                            <Edit3 className="h-3 w-3 mr-1" />
                            Editar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => downloadImage(image)}
                          >
                            <Download className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => deleteImage(image.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <ImageIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">Nenhuma imagem na galeria</h3>
            <p className="text-gray-500 mb-4">
              Faça upload de gráficos e imagens relacionadas à sua pesquisa para começar.
            </p>
            <Button onClick={() => fileInputRef.current?.click()}>
              <Upload className="h-4 w-4 mr-2" />
              Fazer Upload
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Modal de Visualização */}
      {isModalOpen && selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-auto">
            <div className="p-4 border-b flex justify-between items-center">
              <div>
                <h3 className="text-lg font-medium">{selectedImage.title}</h3>
                {selectedImage.description && (
                  <p className="text-sm text-gray-600">{selectedImage.description}</p>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsModalOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="p-4">
              <img
                src={selectedImage.dataUrl}
                alt={selectedImage.title}
                className="max-w-full max-h-[60vh] mx-auto"
              />
            </div>
            
            <div className="p-4 border-t bg-gray-50">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="font-medium">Dimensões:</span>
                  <br />
                  {selectedImage.width} × {selectedImage.height} px
                </div>
                <div>
                  <span className="font-medium">Original:</span>
                  <br />
                  {selectedImage.originalWidth} × {selectedImage.originalHeight} px
                </div>
                <div>
                  <span className="font-medium">Tamanho:</span>
                  <br />
                  {formatFileSize(selectedImage.fileSize)}
                </div>
                <div>
                  <span className="font-medium">Upload:</span>
                  <br />
                  {new Date(selectedImage.uploadDate).toLocaleDateString()}
                </div>
              </div>
              
              <div className="flex gap-2 mt-4">
                <Button
                  onClick={() => downloadImage(selectedImage)}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsModalOpen(false);
                    startEditing(selectedImage);
                  }}
                  className="flex items-center gap-2"
                >
                  <Edit3 className="h-4 w-4" />
                  Editar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Informações sobre armazenamento */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Armazenamento Local:</strong> As imagens são armazenadas localmente no seu navegador. 
          Para backup permanente, use a função "Exportar Metadados" e salve as imagens individualmente.
          As imagens são automaticamente redimensionadas para otimizar o armazenamento.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default ResearchGallery;

