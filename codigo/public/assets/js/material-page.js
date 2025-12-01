// Material details page logic (separated from HTML)
(() => {
  'use strict';

  const fakeDatabase = {
    'algoritmos1': {
      titulo: 'Resumo de Algoritmos I - Aula 1 a 5',
      autor: 'Usuário #10',
      tag: 'Algoritmos e Estruturas de Dados I',
      descricao: 'Anotações e exemplos dos primeiros cinco módulos de Algoritmos e Estruturas de Dados. Inclui notação Big O.',
      tipo: 'pdf',
      conteudo: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhQWgUaXUtHP2XffoiG_lKE8WJYEnyL_Tj-TbZ4tZRrf54rT4R4wsJNlAuUIPyb28icyid6luip3pI3B7WJucGF2eeZ1hT3B6f5o0wc4tfAR6NuWl8kNxOu-voOM0LZlQW8ZB5TKFNf1ys/s1600/alg+001.jpg'
    },
    'calculo2': {
      titulo: 'Cálculo II - Integrais Duplas',
      autor: 'Usuário #11',
      tag: 'Cálculo Diferencial e Integral II',
      descricao: 'Guia passo a passo para resolver integrais duplas, com foco nos teoremas de Fubini e aplicações em volume.',
      tipo: 'pdf',
      conteudo: 'https://files.passeidireto.com/6de3eb5f-3c0f-4fbb-a770-deb9d5925a42/bg1.png'
    },
    'historia': {
      titulo: 'Mapa Mental - História Moderna',
      autor: 'Usuário #10',
      tag: 'História Moderna',
      descricao: 'Esquema visual sobre a Revolução Francesa e o Iluminismo, ótimo para revisão rápida.',
      tipo: 'pdf',
      conteudo: 'https://i0.wp.com/maps4study.com.br/wp-content/uploads/2023/06/1.png?w=2000&ssl=1'
    },
    'quimica': {
      titulo: 'Tópicos de Termoquímica',
      autor: 'Usuário #12',
      tag: 'Termoquímica Avançada',
      descricao: 'Anotações do Professor Silva, focado em conceitos complexos de Termoquímica. Nível de dificuldade alto.',
      tipo: 'pdf',
      conteudo: 'https://i.pinimg.com/736x/80/ec/45/80ec45949c9f9219c3fccd4dab179b0d.jpg'
    }
  };

  document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const materialId = urlParams.get('id');
    const data = fakeDatabase[materialId];

    const tituloEl = document.getElementById('material-titulo');
    const autorEl = document.getElementById('material-autor');
    const tagEl = document.getElementById('material-tag');
    const viewerEl = document.getElementById('material-viewer');
    const descricaoEl = document.getElementById('material-descricao');
    const downloadBtn = document.getElementById('btn-download');

    if (!data) {
      if (tituloEl) tituloEl.textContent = 'Erro 404: Material não encontrado';
      if (autorEl) autorEl.textContent = 'O ID solicitado não existe.';
      if (tagEl) tagEl.style.display = 'none';
      if (viewerEl) viewerEl.innerHTML = '<p>Não foi possível carregar o material. Tente voltar para a página inicial.</p>';
      if (descricaoEl) descricaoEl.textContent = '';
      return;
    }

    document.title = data.titulo + ' - Tarefando';
    if (tituloEl) tituloEl.textContent = data.titulo;
    if (autorEl) autorEl.textContent = 'Enviado por ' + data.autor;
    if (tagEl) tagEl.textContent = data.tag;
    if (descricaoEl) descricaoEl.textContent = data.descricao;
    if (viewerEl) viewerEl.innerHTML = '';

    if (data.tipo === 'pdf') {
      const iframe = document.createElement('iframe');
      iframe.src = data.conteudo;
      iframe.title = data.titulo;
      viewerEl && viewerEl.appendChild(iframe);
      if (downloadBtn) {
        downloadBtn.href = data.conteudo;
        downloadBtn.setAttribute('download', data.titulo + '.pdf');
      }
    } else if (data.tipo === 'image') {
      const img = document.createElement('img');
      img.src = data.conteudo;
      img.alt = data.titulo;
      viewerEl && viewerEl.appendChild(img);
      if (downloadBtn) {
        downloadBtn.href = data.conteudo;
        downloadBtn.setAttribute('download', data.titulo + '.png');
      }
    } else if (data.tipo === 'text') {
      const textDiv = document.createElement('div');
      textDiv.className = 'material-text-content';
      textDiv.innerHTML = data.conteudo;
      viewerEl && viewerEl.appendChild(textDiv);
      if (downloadBtn) {
        downloadBtn.textContent = 'Não disponível para download';
        downloadBtn.classList.remove('cta');
        downloadBtn.href = '#';
        downloadBtn.onclick = (e) => e.preventDefault();
      }
    }
  });
})();

