import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import Select from "react-select";

const MultiSelectJogos = ({ selectedJogos, setSelectedJogos }) => {
  const [jogos, setJogos] = useState([]);

  useEffect(() => {
    async function fetchJogos() {
      try {
        const response = await fetch("http://localhost:3000/jogos"); // Ajuste a URL para o seu backend
        const data = await response.json();

        // Formatar os jogos para o formato esperado pelo react-select
        const formattedJogos = data.map((jogo) => ({
          value: jogo.id,
          label: jogo.name,
        }));
        setJogos(formattedJogos);
      } catch (error) {
        console.error("Erro ao buscar jogos:", error);
      }
    }

    fetchJogos();
  }, []);

  const handleChange = (selectedOptions) => {
    setSelectedJogos(selectedOptions);
    console.log("Jogos selecionados:", selectedOptions);
  };
  const customStyles = {
    option: (provided, state) => ({
      ...provided,
      color: state.isSelected ? "white" : "black", // Cor do texto das opções
      backgroundColor: state.isSelected ? "#646cff" : "white", // Cor de fundo ao selecionar
      "&:hover": {
        backgroundColor: "#e2e2e2", // Cor de fundo ao passar o mouse
        color: "black", // Cor do texto ao passar o mouse
      },
    }),
    control: (provided) => ({
      ...provided,
      borderColor: "#ccc",
      boxShadow: "none",
      "&:hover": {
        borderColor: "#646cff",
      },
    }),
    multiValue: (provided) => ({
      ...provided,
      backgroundColor: "#f0f0f0",
    }),
    multiValueLabel: (provided) => ({
      ...provided,
      color: "black", // Cor do texto das tags selecionadas
    }),
    multiValueRemove: (provided) => ({
      ...provided,
      color: "#646cff",
      ":hover": {
        backgroundColor: "#e2e2e2",
        color: "black",
      },
    }),
  };
  return (
    <div>
      <h2>Selecione os jogos</h2>
      <Select
        isMulti
        options={jogos}
        value={selectedJogos}
        onChange={handleChange}
        placeholder="Selecione os jogos"
        noOptionsMessage={() => "Nenhum jogo encontrado"}
        styles={customStyles}
      />
    </div>
  );
};
MultiSelectJogos.propTypes = {
  selectedJogos: PropTypes.array.isRequired, // Deve ser um array
  setSelectedJogos: PropTypes.func.isRequired, // Deve ser uma função
};
export default MultiSelectJogos;
