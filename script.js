document.addEventListener("DOMContentLoaded", () => {
    const hoje = new Date();
    const dataLimite = new Date("2026-01-01");

    if (hoje >= dataLimite) {
        document.body.innerHTML = `
        <div style="
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            background-color: #a908f3ff;
        ">
            <div style="
                max-width: 500px;
                width: 90%;
                padding: 40px;
                border-radius: 10px;
                background-color: white;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                text-align: center;
            ">
                <h1 style="color: red; font-size: 2em; margin-bottom: 10px;">ATUALIZE AS MATÉRIAS</h1>
                <p style="color: #333; font-size: 1.1em;">O sistema expirou. Atualize os dados para continuar usando.</p>
            </div>
        </div>
        `;
        throw new Error("Sistema expirado");
    }

    // Função para gerar opções de mês
    function gerarOpcoesMes() {
        const select = document.getElementById("filtro-mes");
        if (!select) return;

        const hoje = new Date();
        const inicio = new Date("2024-01-01");
        const fim = new Date("2026-01-01");

        while (inicio < fim) {
            const valor = `${inicio.getFullYear()}-${String(inicio.getMonth() + 1).padStart(2, "0")}`;
            const nome = inicio.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
            const option = document.createElement("option");
            option.value = valor;
            option.textContent = nome.charAt(0).toUpperCase() + nome.slice(1);

            if (
                inicio.getMonth() === hoje.getMonth() &&
                inicio.getFullYear() === hoje.getFullYear()
            ) {
                option.selected = true;
            }

            select.appendChild(option);
            inicio.setMonth(inicio.getMonth() + 1);
        }
    }

    // Inicialização do sistema
    gerarOpcoesMes();
    atualizarData();
    gerarCalendario();
    atualizarEstatisticas();
    configurarAbas();
    agendarNotificacao();
});

// CONFIGURAÇÕES
const limiteFaltas = 20;
const faltaEquivalente = 4;
let mesAtual = new Date().getMonth();
let anoAtual = new Date().getFullYear();
const diasSemana = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const materiasPorDia = {
    1: "Estatística Orientada à Ciência de Dados",
    2: "Algoritmo e Programação de Computadores",
    3: "Arquitetura de Computadores",
    4: "Jornada",
    5: "Fundamentos de Engenharia de Software"
};

// VERIFICA VALIDADE DO SISTEMA
const hoje = new Date();
const validade = new Date("2026-01-01");
if (hoje >= validade) {
    document.body.innerHTML = `
    <div style="color: red; font-size: 2em; text-align: center; margin-top: 50px;">
      ALTERE AS MATÉRIAS
    </div>
  `;
    throw new Error("Sistema expirado");
}

// INICIALIZAÇÃO
document.addEventListener("DOMContentLoaded", () => {
    atualizarData();
    gerarCalendario();
    atualizarEstatisticas();
    configurarAbas();
    agendarNotificacao();
});

// ATUALIZA DATA E MATÉRIA DO DIA
function atualizarData() {
    const hoje = new Date();
    const diaSemana = hoje.getDay();
    const dataFormatada = hoje.toLocaleDateString("pt-BR");
    document.getElementById("data-hoje").textContent = dataFormatada;
    document.getElementById("materia-hoje").textContent = materiasPorDia[diaSemana] || "Sem aula";
}

// REGISTRA PRESENÇA OU FALTA
function registrarPresenca(presente) {
    const hoje = new Date().toISOString().split("T")[0];
    const diaSemana = new Date().getDay();
    const materia = materiasPorDia[diaSemana] || "Sem aula";
    const status = presente ? "presenca" : "falta";

    const registros = JSON.parse(localStorage.getItem("registros") || "{}");
    registros[hoje] = { status, materia };
    localStorage.setItem("registros", JSON.stringify(registros));

    document.getElementById("status-hoje").textContent = presente ? "Presente" : "Faltou";
    gerarCalendario();
    atualizarEstatisticas();
}

// GERA CALENDÁRIO INTERATIVO
function gerarCalendario() {
    const grid = document.getElementById("calendario-grid");
    grid.innerHTML = "";

    const ultimoDia = new Date(anoAtual, mesAtual + 1, 0);
    const registros = JSON.parse(localStorage.getItem("registros") || "{}");

    // Atualiza título do mês
    const nomeMes = ultimoDia.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
    document.getElementById("mes-atual").textContent = nomeMes.charAt(0).toUpperCase() + nomeMes.slice(1);

    for (let dia = 1; dia <= ultimoDia.getDate(); dia++) {
        const data = new Date(anoAtual, mesAtual, dia);
        const iso = data.toISOString().split("T")[0];
        const diaSemana = data.getDay();
        const materia = materiasPorDia[diaSemana] || "Sem aula";
        const registro = registros[iso];

        const div = document.createElement("div");
        div.className = "day";
        div.innerHTML = `
          <strong>${dia}</strong><br>
          <small>${diasSemana[diaSemana]}</small><br>
          <small>${materia}</small>
        `;

        if (registro) {
            div.classList.add(registro.status);
            div.title = `${registro.materia} - ${registro.status === "falta" ? "Faltou" : "Presente"}`;
        }

        div.onclick = () => editarDia(iso, registro?.status || "", materia);
        grid.appendChild(div);
    }
}
function mudarMes(direcao) {
    mesAtual += direcao;

    if (mesAtual > 11) {
        mesAtual = 0;
        anoAtual++;
    } else if (mesAtual < 0) {
        mesAtual = 11;
        anoAtual--;
    }

    const limite = new Date("2026-01-01");
    const dataAtual = new Date(anoAtual, mesAtual);

    if (dataAtual >= limite) {
        alert("Limite de visualização atingido.");
        mesAtual -= direcao;
        if (direcao > 0) anoAtual--; else anoAtual++;
        return;
    }

    gerarCalendario();
    atualizarEstatisticas(); // <- garante que as stats reflitam qualquer edição
}

function mudarMes(direcao) {
    mesAtual += direcao;

    if (mesAtual > 11) {
        mesAtual = 0;
        anoAtual++;
    } else if (mesAtual < 0) {
        mesAtual = 11;
        anoAtual--;
    }

    const limite = new Date("2026-01-01");
    const dataAtual = new Date(anoAtual, mesAtual);

    if (dataAtual >= limite) {
        alert("Limite de visualização atingido.");
        mesAtual -= direcao; // desfaz mudança
        if (direcao > 0) anoAtual--; else anoAtual++;
        return;
    }

    gerarCalendario();
}

// EDIÇÃO DE DIA NO CALENDÁRIO
function editarDia(dataISO, statusAtual, materia) {
    const escolha = prompt(
        `Editar ${dataISO} (${materia})\nDigite uma das opções:\n• "presenca"\n• "falta"\n• "remover"`,
        statusAtual
    );

    const registros = JSON.parse(localStorage.getItem("registros") || "{}");

    if (escolha === "remover") {
        delete registros[dataISO];
    } else if (escolha === "presenca" || escolha === "falta") {
        registros[dataISO] = { status: escolha, materia };
    } else {
        return;
    }

    localStorage.setItem("registros", JSON.stringify(registros));
    gerarCalendario();
    atualizarEstatisticas();
}

function atualizarEstatisticas() {
    const registros = JSON.parse(localStorage.getItem("registros") || "{}");
    const faltasPorMateria = {};
    let faltasTotais = 0;

    // Verifica se há filtro de mês
    const filtro = document.getElementById("filtro-mes")?.value;
    const [anoFiltro, mesFiltro] = filtro ? filtro.split("-").map(Number) : [null, null];

    for (const [data, info] of Object.entries(registros)) {
        const [ano, mes] = data.split("-").map(Number);
        if (anoFiltro && mesFiltro && (ano !== anoFiltro || mes !== mesFiltro)) continue;

        if (info.status === "falta") {
            const materia = info.materia;
            faltasPorMateria[materia] = (faltasPorMateria[materia] || 0) + faltaEquivalente;
            faltasTotais += faltaEquivalente;
        }
    }

    const container = document.getElementById("estatisticas-materias");
    container.innerHTML = "";

    for (const materia of Object.values(materiasPorDia)) {
        const faltas = faltasPorMateria[materia] || 0;
        const porcentagem = ((faltas / limiteFaltas) * 100).toFixed(1);

        container.innerHTML += `
        <div class="stat-item">
            <strong>${materia}</strong>
            <p>Faltas: ${faltas} / ${limiteFaltas} (${porcentagem}%)</p>
            <div class="progress-bar">
                <div class="progress" style="width: ${porcentagem}%"></div>
            </div>
        </div>
        `;
    }

    const porcentagemTotal = ((faltasTotais / 100) * 100).toFixed(1); // 100 aulas totais
    const faltasRestantes = Math.max(0, limiteFaltas - faltasTotais);
    document.getElementById("total-faltas").textContent = faltasTotais;
    document.getElementById("porcentagem").textContent = `${porcentagemTotal}%`;
    document.getElementById("faltas-restantes").textContent = faltasRestantes;
    document.getElementById("progresso-geral").style.width = `${porcentagemTotal}%`;

    // Alerta por matéria
    const materiasEmRisco = [];

    for (const materia of Object.values(materiasPorDia)) {
        const faltas = faltasPorMateria[materia] || 0;
        const porcentagem = (faltas / limiteFaltas) * 100;

        if (porcentagem >= 80 && faltas < limiteFaltas) {
            materiasEmRisco.push(materia);
        }
    }

    const alerta = document.getElementById("alerta-reprovacao");

    if (materiasEmRisco.length > 0) {
        alerta.innerHTML = `⚠️ Você está perto do limite de faltas nas seguintes matérias:<br>• ${materiasEmRisco.join("<br>• ")}`;
    } else if (Object.values(faltasPorMateria).some(f => f >= limiteFaltas)) {
        alerta.textContent = "❌ Você ultrapassou o limite de faltas em uma ou mais matérias!";
    } else {
        alerta.textContent = "";
    }
}

function abrirMenuCompartilhar() {
  const menu = document.getElementById("menu-compartilhar");
  menu.style.display = menu.style.display === "flex" ? "none" : "flex";
}

function compartilharMensagem(app) {
  const texto = gerarMensagemCompleta();
  const encoded = encodeURIComponent(texto);

  if (app === "whatsapp") {
    window.open(`https://wa.me/?text=${encoded}`, "_blank");
  } else if (app === "telegram") {
    window.open(`https://t.me/share/url?url=&text=${encoded}`, "_blank");
  } else if (app === "email") {
    window.open(`mailto:?subject=Resumo do Segundo Semestre&body=${encoded}`, "_blank");
  }
}

function copiarMensagem() {
  const texto = gerarMensagemCompleta();
  navigator.clipboard.writeText(texto).then(() => {
    document.getElementById("texto-exportado").textContent = "Texto copiado com sucesso!";
  });
}

function gerarMensagemCompleta() {
  const registros = JSON.parse(localStorage.getItem("registros") || "{}");
  const filtro = document.getElementById("filtro-mes")?.value;
  const [anoFiltro, mesFiltro] = filtro ? filtro.split("-").map(Number) : [null, null];

  const dataAtualizacao = new Date().toLocaleDateString("pt-BR");
  let texto = `📚 *Resumo do Segundo Semestre (${filtro})*\n`;
  texto += `🕒 Última atualização: ${dataAtualizacao}\n\n`;

  let faltas = 0;
  let detalhes = "";

  for (const [data, info] of Object.entries(registros)) {
    const [ano, mes] = data.split("-").map(Number);
    if (anoFiltro && mesFiltro && (ano !== anoFiltro || mes !== mesFiltro)) continue;

    if (info.status === "falta") {
      detalhes += `• ${data} - ${info.materia}\n`;
      faltas += faltaEquivalente;
    }
  }

  const faltasRestantes = Math.max(0, limiteFaltas - faltas);
  const porcentagem = ((faltas / limiteFaltas) * 100).toFixed(1);

  texto += `❌ Total de faltas: ${faltas}\n`;
  texto += `📊 Porcentagem do limite: ${porcentagem}%\n`;
  texto += `⚠️ Faltam para reprovar: ${faltasRestantes}\n\n`;
  texto += `📌 *Detalhes das faltas:*\n${detalhes || "Nenhuma falta registrada."}`;

  return texto.trim();
}


// ABAS
function configurarAbas() {
    const botoes = document.querySelectorAll(".tab-btn");
    const secoes = document.querySelectorAll("main section");

    botoes.forEach(btn => {
        btn.onclick = () => {
            botoes.forEach(b => b.classList.remove("active"));
            secoes.forEach(s => s.classList.remove("active"));
            btn.classList.add("active");
            document.getElementById(btn.dataset.tab).classList.add("active");
        };
    });
}
function gerarOpcoesMes() {
    const select = document.getElementById("filtro-mes");
    if (!select) return;

    const inicio = new Date("2024-01-01");
    const fim = new Date("2026-01-01");
    const hoje = new Date();

    while (inicio < fim) {
        const valor = `${inicio.getFullYear()}-${String(inicio.getMonth() + 1).padStart(2, "0")}`;
        const nome = inicio.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
        const option = document.createElement("option");
        option.value = valor;
        option.textContent = nome.charAt(0).toUpperCase() + nome.slice(1);

        // Seleciona o mês atual por padrão
        if (
            inicio.getMonth() === hoje.getMonth() &&
            inicio.getFullYear() === hoje.getFullYear()
        ) {
            option.selected = true;
        }

        select.appendChild(option);
        inicio.setMonth(inicio.getMonth() + 1);
    }
}

// NOTIFICAÇÃO DIÁRIA
function agendarNotificacao() {
    if (!("Notification" in window)) return;

    if (Notification.permission !== "granted") {
        Notification.requestPermission().then(permission => {
            if (permission !== "granted") return;
            agendarNotificacao(); // tenta novamente se for concedido
        });
        return;
    }

    const agora = new Date();
    const horaAlvo = new Date();
    horaAlvo.setHours(19, Math.floor(Math.random() * 30), 0); // entre 19:00 e 19:30

    const tempoAteNotificacao = horaAlvo - agora;
    if (tempoAteNotificacao > 0) {
        setTimeout(() => {
            new Notification("Você foi para a faculdade hoje?");
        }, tempoAteNotificacao);
    }
}
