// ==========================================
// METEOVISION
// ==========================================

let latitude = -25.7778;
let longitude = -49.3289;

let nomeLocal = "Mandirituba";
let estadoLocal = "PR";

let mapa;
let marcadorLocal;

let mapaNormal;
let mapaSatelite;

let camadaRadar = null;

let radarAtivo = false;
let sateliteAtivo = false;


// ==========================================
// APIs
// ==========================================

const API_TEMPO =
    "https://api.open-meteo.com/v1/forecast";

const API_GEOCODING =
    "https://geocoding-api.open-meteo.com/v1/search";

const API_RAINVIEWER =
    "https://api.rainviewer.com/public/weather-maps.json";


// ==========================================
// INICIAR
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    iniciar
);


function iniciar() {

    iniciarMapa();

    configurarBotoes();

    atualizarTudo();

    // Tempo atual: 5 minutos
    setInterval(
        atualizarTempoAtual,
        5 * 60 * 1000
    );

    // Previsão: 30 minutos
    setInterval(
        atualizarPrevisao,
        30 * 60 * 1000
    );

    // Radar: 10 minutos
    setInterval(
        carregarRadar,
        10 * 60 * 1000
    );
}


// ==========================================
// MAPA
// ==========================================

function iniciarMapa() {

    mapa = L.map(
        "mapa",
        {
            zoomControl: true,
            attributionControl: true
        }
    ).setView(
        [latitude, longitude],
        8
    );


    // ======================================
    // MAPA NORMAL
    // ======================================

    mapaNormal = L.tileLayer(

        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}",

        {
            maxZoom: 19,

            attribution:
                "© Esri"
        }

    );


    mapaNormal.addTo(mapa);


    // ======================================
    // MAPA SATÉLITE
    // ======================================

    mapaSatelite = L.tileLayer(

        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",

        {
            maxZoom: 19,

            attribution:
                "© Esri"
        }

    );


    // ======================================
    // MARCADOR
    // ======================================

    marcadorLocal = L.marker(
        [
            latitude,
            longitude
        ]
    )

    .addTo(mapa)

    .bindPopup(
        `<strong>${nomeLocal}, ${estadoLocal}</strong>`
    )

    .openPopup();
}


// ==========================================
// BOTÕES
// ==========================================

function configurarBotoes() {

    const btnRadar =
        document.getElementById(
            "btnRadar"
        );


    const btnSatelite =
        document.getElementById(
            "btnSatelite"
        );


    const btnVoltar =
        document.getElementById(
            "btnVoltarLocal"
        );


    const btnBuscar =
        document.getElementById(
            "btnBuscar"
        );


    const inputLocal =
        document.getElementById(
            "inputLocal"
        );


    const btnLocalizacao =
        document.getElementById(
            "btnLocalizacao"
        );


    // RADAR

    if (btnRadar) {

        btnRadar.addEventListener(
            "click",
            alternarRadar
        );

    }


    // SATÉLITE

    if (btnSatelite) {

        btnSatelite.addEventListener(
            "click",
            alternarSatelite
        );

    }


    // VOLTAR PARA LOCAL

    if (btnVoltar) {

        btnVoltar.addEventListener(
            "click",
            voltarParaLocal
        );

    }


    // BUSCAR

    if (btnBuscar) {

        btnBuscar.addEventListener(
            "click",
            buscarLocal
        );

    }


    // ENTER NA BUSCA

    if (inputLocal) {

        inputLocal.addEventListener(
            "keydown",
            function(event) {

                if (
                    event.key === "Enter"
                ) {

                    buscarLocal();

                }

            }
        );

    }


    // LOCALIZAÇÃO

    if (btnLocalizacao) {

        btnLocalizacao.addEventListener(
            "click",
            usarLocalizacaoDispositivo
        );

    }
}


// ==========================================
// ATUALIZAR TUDO
// ==========================================

async function atualizarTudo() {

    await atualizarTempoAtual();

    await atualizarPrevisao();

    await carregarRadar();
}


// ==========================================
// TEMPO ATUAL
// ==========================================

async function atualizarTempoAtual() {

    try {

        const url =
            `${API_TEMPO}?latitude=${latitude}` +
            `&longitude=${longitude}` +
            `&current=temperature_2m,relative_humidity_2m,precipitation,pressure_msl,wind_speed_10m,wind_gusts_10m,weather_code` +
            `&timezone=America%2FSao_Paulo`;


        const resposta =
            await fetch(url);


        if (!resposta.ok) {

            throw new Error(
                "Erro na API do tempo"
            );

        }


        const dados =
            await resposta.json();


        const atual =
            dados.current;


        const info =
            interpretarTempo(
                atual.weather_code
            );


        document.getElementById(
            "temperaturaAtual"
        ).textContent =
            `${Math.round(
                atual.temperature_2m
            )}°C`;


        document.getElementById(
            "condicaoAtual"
        ).textContent =
            info.nome;


        document.getElementById(
            "iconeAtual"
        ).textContent =
            info.icone;


        document.getElementById(
            "umidadeAtual"
        ).textContent =
            `${Math.round(
                atual.relative_humidity_2m
            )}%`;


        document.getElementById(
            "chuvaAtual"
        ).textContent =
            `${Number(
                atual.precipitation
            ).toFixed(1)} mm`;


        document.getElementById(
            "pressaoAtual"
        ).textContent =
            `${Math.round(
                atual.pressure_msl
            )} hPa`;


        document.getElementById(
            "ventoAtual"
        ).textContent =
            `${Math.round(
                atual.wind_speed_10m
            )} km/h`;


        document.getElementById(
            "rajadaAtual"
        ).textContent =
            `${Math.round(
                atual.wind_gusts_10m
            )} km/h`;


        const agora =
            new Date();


        document.getElementById(
            "horaAtualizacao"
        ).textContent =
            `Atualizado às ${
                agora.toLocaleTimeString(
                    "pt-BR",
                    {
                        hour: "2-digit",
                        minute: "2-digit"
                    }
                )
            }`;


        const status =
            document.getElementById(
                "statusTexto"
            );


        if (status) {

            status.textContent =
                "Dados atualizados";

        }


    } catch (erro) {

        console.error(
            "Erro no tempo:",
            erro
        );


        const status =
            document.getElementById(
                "statusTexto"
            );


        if (status) {

            status.textContent =
                "Erro ao atualizar";

        }

    }
}


// ==========================================
// PREVISÃO DE 7 DIAS
// ==========================================

async function atualizarPrevisao() {

    const container =
        document.getElementById(
            "previsao"
        );


    if (!container) return;


    try {

        container.innerHTML =
            "<p>Carregando previsão...</p>";


        const url =
            `${API_TEMPO}?latitude=${latitude}` +
            `&longitude=${longitude}` +
            `&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,precipitation_sum` +
            `&forecast_days=7` +
            `&timezone=America%2FSao_Paulo`;


        const resposta =
            await fetch(url);


        if (!resposta.ok) {

            throw new Error(
                "Erro na previsão"
            );

        }


        const dados =
            await resposta.json();


        const diario =
            dados.daily;


        container.innerHTML = "";


        for (
            let i = 0;
            i < diario.time.length;
            i++
        ) {

            const data =
                new Date(
                    `${diario.time[i]}T12:00:00`
                );


            const nomeDia =
                data
                .toLocaleDateString(
                    "pt-BR",
                    {
                        weekday: "short"
                    }
                )
                .replace(
                    ".",
                    ""
                );


            const dataFormatada =
                data
                .toLocaleDateString(
                    "pt-BR",
                    {
                        day: "2-digit",
                        month: "2-digit"
                    }
                );


            const info =
                interpretarTempo(
                    diario.weather_code[i]
                );


            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "previsao-card";


            card.innerHTML = `

                <div class="previsao-dia">
                    ${capitalizar(nomeDia)}
                </div>

                <div class="previsao-data">
                    ${dataFormatada}
                </div>

                <div class="previsao-icone">
                    ${info.icone}
                </div>

                <div class="previsao-condicao">
                    ${info.nome}
                </div>

                <div class="max">
                    ${Math.round(
                        diario.temperature_2m_max[i]
                    )}°C
                </div>

                <div class="min">
                    ${Math.round(
                        diario.temperature_2m_min[i]
                    )}°C
                </div>

                <div class="chance-chuva">
                    🌧️ ${
                        diario.precipitation_probability_max[i]
                        ?? 0
                    }% de chance
                </div>

                <div class="precipitacao">
                    ${Number(
                        diario.precipitation_sum[i]
                    ).toFixed(1)} mm
                </div>

            `;


            container.appendChild(
                card
            );

        }


    } catch (erro) {

        console.error(
            "Erro na previsão:",
            erro
        );


        container.innerHTML =
            "<p>Não foi possível carregar a previsão.</p>";

    }
}


// ==========================================
// RADAR METEOROLÓGICO
// ==========================================

async function carregarRadar() {

    try {

        const resposta =
            await fetch(
                API_RAINVIEWER
            );


        if (!resposta.ok) {

            throw new Error(
                "Erro no radar"
            );

        }


        const dados =
            await resposta.json();


        const frames =
            dados.radar?.past || [];


        if (!frames.length) {

            mostrarMensagemRadar(
                "Radar indisponível no momento."
            );

            return;
        }


        const frame =
            frames[
                frames.length - 1
            ];


        if (camadaRadar) {

            mapa.removeLayer(
                camadaRadar
            );

        }


        const urlTiles =
            `${dados.host}${frame.path}/256/{z}/{x}/{y}/2/1_0.png`;


        camadaRadar =
            L.tileLayer(
                urlTiles,
                {
                    opacity: 0.65,

                    maxZoom: 19,

                    maxNativeZoom: 7,

                    zIndex: 500,

                    attribution:
                        "Radar: RainViewer"
                }
            );


        if (radarAtivo) {

            camadaRadar.addTo(
                mapa
            );

        }


    } catch (erro) {

        console.error(
            "Erro no radar:",
            erro
        );

    }
}


// ==========================================
// LIGAR / DESLIGAR RADAR
// ==========================================

async function alternarRadar() {

    radarAtivo =
        !radarAtivo;


    const botao =
        document.getElementById(
            "btnRadar"
        );


    const legenda =
        document.getElementById(
            "legendaRadar"
        );


    if (!camadaRadar) {

        await carregarRadar();

    }


    if (
        radarAtivo &&
        camadaRadar
    ) {

        camadaRadar.addTo(
            mapa
        );


        if (botao) {

            botao.classList.add(
                "ativo"
            );

        }


        if (legenda) {

            legenda.style.display =
                "flex";

        }


    } else {

        if (camadaRadar) {

            mapa.removeLayer(
                camadaRadar
            );

        }


        if (botao) {

            botao.classList.remove(
                "ativo"
            );

        }


        if (legenda) {

            legenda.style.display =
                "none";

        }

    }
}


// ==========================================
// MAPA DE SATÉLITE
// ==========================================

function alternarSatelite() {

    sateliteAtivo =
        !sateliteAtivo;


    const botao =
        document.getElementById(
            "btnSatelite"
        );


    if (sateliteAtivo) {

        // Retira mapa normal

        if (
            mapa.hasLayer(
                mapaNormal
            )
        ) {

            mapa.removeLayer(
                mapaNormal
            );

        }


        // Coloca satélite

        mapaSatelite.addTo(
            mapa
        );


        if (botao) {

            botao.classList.add(
                "ativo"
            );


            botao.title =
                "Voltar para mapa normal";

        }


    } else {

        // Retira satélite

        if (
            mapa.hasLayer(
                mapaSatelite
            )
        ) {

            mapa.removeLayer(
                mapaSatelite
            );

        }


        // Coloca mapa normal

        mapaNormal.addTo(
            mapa
        );


        if (botao) {

            botao.classList.remove(
                "ativo"
            );


            botao.title =
                "Mostrar mapa de satélite";

        }

    }
}


// ==========================================
// VOLTAR PARA O LOCAL
// ==========================================

function voltarParaLocal() {

    mapa.setView(
        [
            latitude,
            longitude
        ],
        8,
        {
            animate: true
        }
    );


    if (marcadorLocal) {

        marcadorLocal.openPopup();

    }
}


// ==========================================
// BUSCAR LOCAL
// ==========================================

async function buscarLocal() {

    const input =
        document.getElementById(
            "inputLocal"
        );


    if (!input) return;


    const texto =
        input.value.trim();


    if (!texto) return;


    const botao =
        document.getElementById(
            "btnBuscar"
        );


    if (botao) {

        botao.textContent =
            "Buscando...";

        botao.disabled =
            true;

    }


    try {

        const url =
            `${API_GEOCODING}?name=${encodeURIComponent(texto)}` +
            `&count=10&language=pt&format=json`;


        const resposta =
            await fetch(url);


        if (!resposta.ok) {

            throw new Error(
                "Erro na busca"
            );

        }


        const dados =
            await resposta.json();


        if (
            !dados.results ||
            dados.results.length === 0
        ) {

            alert(
                "Local não encontrado."
            );

            return;
        }


        const resultado =
            dados.results.find(
                item =>
                    item.country_code === "br"
            ) ||
            dados.results[0];


        definirLocal(
            resultado.latitude,
            resultado.longitude,
            resultado.name,
            resultado.admin1 ||
            resultado.country ||
            ""
        );


    } catch (erro) {

        console.error(
            "Erro na busca:",
            erro
        );


        alert(
            "Não foi possível pesquisar o local."
        );


    } finally {

        if (botao) {

            botao.textContent =
                "Buscar";

            botao.disabled =
                false;

        }

    }
}


// ==========================================
// LOCALIZAÇÃO DO DISPOSITIVO
// ==========================================

function usarLocalizacaoDispositivo() {

    if (
        !navigator.geolocation
    ) {

        alert(
            "Seu navegador não permite obter a localização."
        );

        return;
    }


    const botao =
        document.getElementById(
            "btnLocalizacao"
        );


    if (botao) {

        botao.textContent =
            "Obtendo...";

        botao.disabled =
            true;

    }


    navigator.geolocation.getCurrentPosition(

        async function(posicao) {

            const lat =
                posicao.coords.latitude;


            const lon =
                posicao.coords.longitude;


            let nome =
                "Minha localização";


            let estado =
                "";


            try {

                const url =
                    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10&addressdetails=1`;


                const resposta =
                    await fetch(url);


                const dados =
                    await resposta.json();


                nome =
                    dados.address?.city ||
                    dados.address?.town ||
                    dados.address?.municipality ||
                    dados.address?.village ||
                    "Minha localização";


                estado =
                    dados.address?.state ||
                    "";

            } catch (erro) {

                console.warn(
                    "Não foi possível identificar o local."
                );

            }


            definirLocal(
                lat,
                lon,
                nome,
                estado
            );


            if (botao) {

                botao.textContent =
                    "📍 Minha localização";

                botao.disabled =
                    false;

            }

        },


        function(erro) {

            console.error(
                erro
            );


            alert(
                "Não foi possível obter sua localização."
            );


            if (botao) {

                botao.textContent =
                    "📍 Minha localização";

                botao.disabled =
                    false;

            }

        },


        {
            enableHighAccuracy: true,

            timeout: 10000,

            maximumAge: 300000
        }

    );
}


// ==========================================
// DEFINIR LOCAL
// ==========================================

function definirLocal(
    lat,
    lon,
    nome,
    estado
) {

    latitude =
        Number(lat);


    longitude =
        Number(lon);


    nomeLocal =
        nome ||
        "Local selecionado";


    estadoLocal =
        estado ||
        "";


    const resultado =
        document.getElementById(
            "resultadoLocal"
        );


    if (resultado) {

        resultado.textContent =
            `Local selecionado: ${nomeLocal}` +
            `${
                estadoLocal
                    ? ", " + estadoLocal
                    : ""
            }`;

    }


    if (marcadorLocal) {

        mapa.removeLayer(
            marcadorLocal
        );

    }


    marcadorLocal =
        L.marker(
            [
                latitude,
                longitude
            ]
        )
        .addTo(mapa)
        .bindPopup(
            `<strong>${nomeLocal}${
                estadoLocal
                    ? ", " + estadoLocal
                    : ""
            }</strong>`
        );


    mapa.setView(
        [
            latitude,
            longitude
        ],
        8,
        {
            animate: true
        }
    );


    marcadorLocal.openPopup();


    atualizarTudo();
}


// ==========================================
// CONDIÇÕES DO TEMPO
// ==========================================

function interpretarTempo(
    codigo
) {

    if (codigo === 0) {

        return {
            nome: "Céu limpo",
            icone: "☀️"
        };

    }


    if (codigo === 1) {

        return {
            nome: "Predominantemente limpo",
            icone: "🌤️"
        };

    }


    if (codigo === 2) {

        return {
            nome: "Parcialmente nublado",
            icone: "⛅"
        };

    }


    if (codigo === 3) {

        return {
            nome: "Nublado",
            icone: "☁️"
        };

    }


    if (
        [45, 48].includes(codigo)
    ) {

        return {
            nome: "Neblina",
            icone: "🌫️"
        };

    }


    if (
        [51, 53, 55, 56, 57]
        .includes(codigo)
    ) {

        return {
            nome: "Garoa",
            icone: "🌦️"
        };

    }


    if (
        [61, 63, 65, 66, 67]
        .includes(codigo)
    ) {

        return {
            nome: "Chuva",
            icone: "🌧️"
        };

    }


    if (
        [71, 73, 75, 77]
        .includes(codigo)
    ) {

        return {
            nome: "Neve",
            icone: "❄️"
        };

    }


    if (
        [80, 81, 82]
        .includes(codigo)
    ) {

        return {
            nome: "Pancadas de chuva",
            icone: "🌧️"
        };

    }


    if (
        [95, 96, 99]
        .includes(codigo)
    ) {

        return {
            nome: "Trovoada",
            icone: "⛈️"
        };

    }


    return {
        nome: "Condição variável",
        icone: "🌤️"
    };
}


// ==========================================
// CAPITALIZAR
// ==========================================

function capitalizar(
    texto
) {

    return (
        texto.charAt(0).toUpperCase() +
        texto.slice(1)
    );

}


// ==========================================
// MENSAGEM RADAR
// ==========================================

function mostrarMensagemRadar(
    texto
) {

    const elemento =
        document.getElementById(
            "mensagemRadar"
        );


    if (!elemento) return;


    elemento.textContent =
        texto;


    elemento.style.display =
        "block";


    setTimeout(
        function() {

            esconderMensagemRadar();

        },
        4000
    );
}


// ==========================================
// ESCONDER MENSAGEM
// ==========================================

function esconderMensagemRadar() {

    const elemento =
        document.getElementById(
            "mensagemRadar"
        );


    if (elemento) {

        elemento.style.display =
            "none";

    }

}