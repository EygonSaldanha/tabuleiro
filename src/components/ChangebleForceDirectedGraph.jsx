import { useEffect, useRef } from "react";
import * as d3 from "d3";
import PropTypes from "prop-types";

function ChangebleForceDirectedGraph({ relationships }) {
  const svgRef = useRef(null);

  // Renderiza o gráfico com o D3
  useEffect(() => {
    if (!relationships.nodes || relationships.nodes.length === 0) return;

    const width = 800;
    const height = 600;

    const svg = d3
      .select(svgRef.current)
      .attr("viewBox", `0 0 ${width} ${height}`) // Responsivo
      .attr("preserveAspectRatio", "xMidYMid meet") // Mantém o aspecto
      .style("width", "100%")
      .style("height", "100%");

    svg.selectAll("*").remove(); // Limpa o gráfico antes de renderizar novamente

    const simulation = d3
      .forceSimulation(relationships.nodes)
      .force(
        "link",
        d3
          .forceLink(relationships.links)
          .id((d) => d.id)
          .distance(100)
      )
      .force("charge", d3.forceManyBody().strength(-200))
      .force("center", d3.forceCenter(width / 2, height / 2));

    // Renderizar os links
    const link = svg
      .append("g")
      .attr("stroke", "#999")
      .attr("stroke-opacity", 0.6)
      .selectAll("line")
      .data(relationships.links)
      .join("line")
      .attr("stroke-width", (d) => Math.sqrt(d.weight));

    // Renderizar os nós
    const node = svg
      .append("g")
      .attr("stroke", "#fff")
      .attr("stroke-width", 1.5)
      .selectAll("circle")
      .data(relationships.nodes)
      .join("circle")
      .attr("r", 10)
      .attr("fill", "#69b3a2")
      .call(drag(simulation));

    // Adicionar labels aos nós
    const label = svg
      .append("g")
      .selectAll("text")
      .data(relationships.nodes)
      .join("text")
      .attr("dy", -15)
      .attr("text-anchor", "middle")
      .text((d) => d.name);

    // Atualizar posições dos links e nós
    simulation.on("tick", () => {
      link
        .attr("x1", (d) => d.source.x)
        .attr("y1", (d) => d.source.y)
        .attr("x2", (d) => d.target.x)
        .attr("y2", (d) => d.target.y);

      node.attr("cx", (d) => d.x).attr("cy", (d) => d.y);

      label.attr("x", (d) => d.x).attr("y", (d) => d.y);
    });

    // Função para arrastar nós
    function drag(simulation) {
      function dragstarted(event, d) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      }

      function dragged(event, d) {
        d.fx = event.x;
        d.fy = event.y;
      }

      function dragended(event, d) {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      }

      return d3
        .drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended);
    }
  }, [relationships]);

  return <svg ref={svgRef} />;
}
ChangebleForceDirectedGraph.propTypes = {
  relationships: PropTypes.array.isRequired, // Deve ser um array
  setRelationships: PropTypes.func.isRequired, // Deve ser uma função
};
export default ChangebleForceDirectedGraph;
