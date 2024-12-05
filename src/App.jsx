import { useState } from "react";
import "./App.css";
import { useEffect } from "react";
import axios from "axios";
import ForceDirectedGraph from "./components/ForceDirectedGraph";
import MultiSelectJogos from "./components/MultiSelectJogos";
import ChangebleForceDirectedGraph from "./components/changebleForceDirectedGraph";

function App() {
  const [relationships, setRelationships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedJogos, setSelectedJogos] = useState([]);
  const [retono, setRetorno] = useState([]);
  const [vizinhosState, setVizinhosState] = useState([]);
  const [final, setfinal] = useState([]);
  const [prov, setProv] = useState([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const ids = selectedJogos.map((e) => e.value).join(",");
        const response = await axios.get(
          `http://localhost:3000/jogos/relationships_by_jogos?ids=${ids}`
        );
        setRetorno(response.data);

        // Converte os dados no formato esperado pelo D3
        const nodes = [];
        const links = response.data.map((rel) => {
          // Adiciona os nós ao array se ainda não existem
          if (!nodes.find((node) => node.id === rel.jogo1.id)) {
            nodes.push({ id: rel.jogo1.id, name: rel.jogo1.name });
          }
          if (!nodes.find((node) => node.id === rel.jogo2.id)) {
            nodes.push({ id: rel.jogo2.id, name: rel.jogo2.name });
          }

          return {
            source: rel.jogo1.id,
            target: rel.jogo2.id,
            weight: rel.weight,
          };
        });

        setRelationships({ nodes, links });
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
      }
    }

    fetchData();
  }, [selectedJogos]);

  useEffect(() => {
    const vizinhos = {};
    selectedJogos.forEach((jogo) => {
      retono.forEach((ligacao) => {
        const jogoSelecionado = jogo.value;
        const { jogo1, jogo2, weight } = ligacao;

        if (jogo1.id === jogoSelecionado || jogo2.id === jogoSelecionado) {
          const vizinho = jogo1.id === jogoSelecionado ? jogo2.id : jogo1.id;

          if (!vizinhos[vizinho]) {
            vizinhos[vizinho] = 0;
          }
          vizinhos[vizinho] += parseFloat(weight);
        }
      });
    });

    const objOrdenado = Object.entries(vizinhos) // Converte o objeto em um array de pares [chave, valor]
      .sort(([, valorA], [, valorB]) => valorB - valorA) // Ordena pelos valores, do maior para o menor
      .reduce((acc, [chave, valor]) => {
        acc[chave] = valor; // Reconstrói o objeto com base na ordem dos valores
        return acc;
      }, {});
    console.log(objOrdenado);
    setVizinhosState(objOrdenado);
  }, [retono, selectedJogos]);

  useEffect(() => {
    let novosJogos = []; // Array para armazenar os jogos encontrados
    Object.keys(vizinhosState).forEach((chave) => {
      const jogoEncontrado = retono.find(
        (r) => r.jogo1.id == chave || r.jogo2.id == chave
      );

      if (jogoEncontrado) {
        // Verifica se encontrou um jogo
        if (jogoEncontrado.jogo1.id == chave) {
          novosJogos.push({
            peso: vizinhosState[chave],
            jogo: jogoEncontrado.jogo1,
          }); // Adiciona jogo1 ao array
          // setProv({ peso: vizinhosState[chave], jogo: jogoEncontrado.jogo1 });
        } else if (jogoEncontrado.jogo2.id == chave) {
          novosJogos.push({
            peso: vizinhosState[chave],
            jogo: jogoEncontrado.jogo2,
          }); // Adiciona jogo2 ao array
          // setProv({ peso: vizinhosState[chave], jogo: jogoEncontrado.jogo2 });
        }
      }
    });
    console.log("Jogos encontrados", novosJogos);
    setProv(novosJogos.sort((a, b) => b.peso - a.peso));
    // setfinal((prev) => [...prev, ...novosJogos]);

    // const resultados = Object.keys(vizinhosState).map((chave) => ({
    //   peso: vizinhosState[chave],
    //   jogo: prov, //retono.find((r) => r.jogo1.id == chave || r.jogo2.id == chave),
    // }));

    // console.log("Resultados: ", resultados);
  }, [vizinhosState, retono]);
  useEffect(() => {
    console.log("prov", prov);
  }, [prov]);
  return (
    <div>
      <MultiSelectJogos
        selectedJogos={selectedJogos}
        setSelectedJogos={setSelectedJogos}
      />
      <h1>Relações</h1>
      <ForceDirectedGraph />
      <ChangebleForceDirectedGraph
        relationships={relationships}
        setRelationships={setRelationships}
      />
      <div style={styles.container}>
        <div style={styles.grid}>
          {prov.map((item, index) => (
            <div key={index} style={styles.card}>
              <img
                src={item.jogo.image_url}
                alt={item.jogo.name}
                style={styles.image}
              />
              <h3 style={styles.title}>{item.jogo.name}</h3>
              <p style={styles.peso}>Peso: {item.peso}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
const styles = {
  container: {
    width: "1200px", // Define um tamanho fixo para o grid
    margin: "0 auto", // Centraliza horizontalmente
    padding: "16px", // Espaçamento interno
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)", // 3 colunas fixas
    gap: "16px", // Espaçamento entre os cards
  },
  card: {
    border: "1px solid #ccc",
    borderRadius: "8px",
    padding: "16px",
    textAlign: "center",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    backgroundColor: "#1a1a1a",
  },
  image: {
    width: "100%",
    height: "auto",
    borderRadius: "8px",
  },
  title: {
    fontSize: "18px",
    margin: "12px 0 8px",
  },
  peso: {
    fontSize: "16px",
    color: "#bbb",
  },
};

export default App;
