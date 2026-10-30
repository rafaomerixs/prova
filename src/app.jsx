
import { useState } from "react";
import {
  GraduationCap, Plus, Search, Printer,
  ClipboardList, CheckCircle2, Clock,
  Trash2, X
} from "lucide-react";

const vazio = {
  professor: "",
  disciplina: "",
  turma: "",
  data: "",
  quantidade: ""
};

function carregar() {
  try {
    const dados = JSON.parse(localStorage.getItem("provacontrol"));
    return Array.isArray(dados) ? dados : [];
  } catch {
    return [];
  }
}

export default function App() {
  const [provas, setProvas] = useState(carregar);
  const [form, setForm] = useState(vazio);
  const [modal, setModal] = useState(false);
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState("Todas");

  function salvar(lista) {
    setProvas(lista);
    localStorage.setItem("provacontrol", JSON.stringify(lista));
  }

  function cadastrar(e) {
    e.preventDefault();

    const nova = {
      ...form,
      id: crypto.randomUUID(),
      status: "Pendente"
    };

    salvar([nova, ...provas]);
    setForm(vazio);
    setModal(false);
  }

  function alterarStatus(id, status) {
    salvar(provas.map(p =>
      p.id === id ? { ...p, status } : p
    ));
  }

  function excluir(id) {
    if (window.confirm("Deseja excluir esta solicitação?")) {
      salvar(provas.filter(p => p.id !== id));
    }
  }

  const pendentes = provas.filter(p => p.status === "Pendente").length;
  const prontas = provas.filter(p => p.status === "Pronta").length;
  const imprimindo = provas.filter(p => p.status === "Imprimindo").length;

  const filtradas = provas.filter(p => {
    const texto = `${p.professor} ${p.disciplina} ${p.turma}`.toLowerCase();

    return texto.includes(busca.toLowerCase()) &&
      (filtro === "Todas" || p.status === filtro);
  });

  return (
    <div className="layout">
      <main className="conteudo">

        <header className="topo">
          <div className="titulo-area">
            <div className="titulo-icone">
              <GraduationCap size={25} />
            </div>

            <div>
              <h1>Painel de Provas</h1>
              <p>Gerenciamento de solicitações de impressão</p>
            </div>
          </div>

          <button
            className="btn-primary"
            onClick={() => setModal(true)}
          >
            <Plus size={18} />
            Nova solicitação
          </button>
        </header>

        <section className="estatisticas">
          <div className="stat">
            <div className="stat-icon azul">
              <ClipboardList />
            </div>
            <span>Total de solicitações</span>
            <strong>{provas.length}</strong>
          </div>

          <div className="stat">
            <div className="stat-icon amarelo">
              <Clock />
            </div>
            <span>Pendentes</span>
            <strong>{pendentes}</strong>
          </div>

          <div className="stat">
            <div className="stat-icon roxo">
              <Printer />
            </div>
            <span>Imprimindo</span>
            <strong>{imprimindo}</strong>
          </div>

          <div className="stat">
            <div className="stat-icon verde">
              <CheckCircle2 />
            </div>
            <span>Prontas</span>
            <strong>{prontas}</strong>
          </div>
        </section>

        <section className="painel">
          <div className="painel-header">
            <div>
              <h2>Solicitações de provas</h2>
              <p>Visualize e acompanhe as solicitações cadastradas.</p>
            </div>
          </div>

          <div className="ferramentas">
            <div className="pesquisa">
              <Search size={18} />
              <input
                placeholder="Buscar professor, disciplina ou turma..."
                value={busca}
                onChange={e => setBusca(e.target.value)}
              />
            </div>

            <select
              value={filtro}
              onChange={e => setFiltro(e.target.value)}
            >
              {["Todas", "Pendente", "Imprimindo", "Pronta"].map(s =>
                <option key={s}>{s}</option>
              )}
            </select>
          </div>

          <div className="tabela-container">
            <table>
              <thead>
                <tr>
                  <th>Professor</th>
                  <th>Disciplina</th>
                  <th>Turma</th>
                  <th>Data</th>
                  <th>Cópias</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>

              <tbody>
                {filtradas.map(p => (
                  <tr key={p.id}>
                    <td className="destaque">{p.professor}</td>
                    <td>{p.disciplina}</td>
                    <td>{p.turma}</td>
                    <td>{p.data.split("-").reverse().join("/")}</td>
                    <td>{p.quantidade}</td>

                    <td>
                      <span className={`status ${p.status.toLowerCase()}`}>
                        {p.status}
                      </span>
                    </td>

                    <td>
                      <div className="acoes">
                        <select
                          aria-label="Alterar status"
                          value={p.status}
                          onChange={e =>
                            alterarStatus(p.id, e.target.value)
                          }
                        >
                          <option>Pendente</option>
                          <option>Imprimindo</option>
                          <option>Pronta</option>
                        </select>

                        <button
                          className="btn-excluir"
                          title="Excluir solicitação"
                          onClick={() => excluir(p.id)}
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filtradas.length === 0 && (
              <div className="vazio">
                <ClipboardList size={38} />
                <h3>Nenhuma solicitação encontrada</h3>
                <p>Cadastre uma nova prova para começar.</p>
              </div>
            )}
          </div>
        </section>
      </main>

      {modal && (
        <div className="overlay" onClick={() => setModal(false)}>
          <div
            className="modal"
            onClick={e => e.stopPropagation()}
          >
            <div className="modal-header">
              <div>
                <h2>Nova solicitação</h2>
                <p>Preencha as informações da prova.</p>
              </div>

              <button
                className="fechar"
                onClick={() => setModal(false)}
              >
                <X size={22} />
              </button>
            </div>

            <form onSubmit={cadastrar}>
              {[
                ["professor", "Nome do professor", "text"],
                ["disciplina", "Disciplina", "text"],
                ["turma", "Turma", "text"],
                ["data", "Data da prova", "date"],
                ["quantidade", "Quantidade de cópias", "number"]
              ].map(([campo, titulo, tipo]) => (
                <label key={campo}>
                  {titulo}

                  <input
                    required
                    type={tipo}
                    min={tipo === "number" ? "1" : undefined}
                    value={form[campo]}
                    onChange={e =>
                      setForm({
                        ...form,
                        [campo]: e.target.value
                      })
                    }
                  />
                </label>
              ))}

              <div className="modal-acoes">
                <button
                  type="button"
                  className="btn-cancelar"
                  onClick={() => setModal(false)}
                >
                  Cancelar
                </button>

                <button
                  className="btn-primary"
                  type="submit"
                >
                  <Plus size={17} />
                  Cadastrar prova
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
