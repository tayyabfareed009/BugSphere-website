import { useEffect, useMemo, useState } from "react";
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiUsers,
  FiSearch,
  FiX,
  FiCheck,
  FiUserPlus,
} from "react-icons/fi";
import toast from "react-hot-toast";
import api from "../../services/api";
import Button from "../../components/Buttons/Button";
import SearchBar from "../../components/SearchBar/SearchBar";
import { PageHeader } from "../Projects/Projects";
import { useAuth } from "../../hooks/useAuth";

// ----------------------------------------------------------------------
// Loading skeleton (cards)
// ----------------------------------------------------------------------
function LoadingCards() {
  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div
          key={i}
          className="h-48 animate-pulse rounded-xl border border-slate-200 bg-slate-100 p-5 dark:border-slate-800 dark:bg-slate-800"
        />
      ))}
    </div>
  );
}

// ----------------------------------------------------------------------
// Empty state (no teams at all)
// ----------------------------------------------------------------------
function EmptyState({ onCreate }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white/60 p-12 text-center dark:border-slate-700 dark:bg-slate-900/30">
      <div className="mb-4 rounded-full bg-slate-100 p-4 dark:bg-slate-800">
        <FiUsers className="h-12 w-12 text-slate-400" />
      </div>
      <h3 className="text-xl font-bold text-slate-900 dark:text-white">
        No teams yet
      </h3>
      <p className="mt-2 max-w-md text-sm text-slate-500 dark:text-slate-400">
        Create your first team to start collaborating on projects and assigning
        work.
      </p>
      {onCreate && (
        <Button className="mt-6" icon={FiPlus} onClick={onCreate}>
          Create Team
        </Button>
      )}
    </div>
  );
}

// ----------------------------------------------------------------------
// No search results
// ----------------------------------------------------------------------
function NoSearchResults({ query }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white/60 p-12 text-center dark:border-slate-700 dark:bg-slate-900/30">
      <div className="mb-4 rounded-full bg-slate-100 p-4 dark:bg-slate-800">
        <FiSearch className="h-12 w-12 text-slate-400" />
      </div>
      <h3 className="text-xl font-bold text-slate-900 dark:text-white">
        No teams found
      </h3>
      <p className="mt-2 max-w-md text-sm text-slate-500 dark:text-slate-400">
        We couldn't find any team matching “{query}”. Try a different keyword.
      </p>
    </div>
  );
}

// ----------------------------------------------------------------------
// Main component
// ----------------------------------------------------------------------
export default function Teams() {
  const { user } = useAuth();
  const isOwner = user?.role === "Owner";

  const [loading, setLoading] = useState(true);
  const [teams, setTeams] = useState([]);
  const [users, setUsers] = useState([]);
  const [query, setQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingTeam, setEditingTeam] = useState(null);

  const emptyForm = {
    name: "",
    lead: "",
    members: [],
  };
  const [form, setForm] = useState(emptyForm);

  // ----------------------------------------------------------------------
  // Data loading
  // ----------------------------------------------------------------------
  const loadData = async () => {
    try {
      setLoading(true);
      const [teamRes, userRes] = await Promise.all([
        api.get("/teams"),
        api.get("/users"),
      ]);
      setTeams(teamRes.data);
      setUsers(userRes.data);
    } catch (err) {
      console.error(err);
      toast.error("Unable to load teams.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // ----------------------------------------------------------------------
  // Filtered teams
  // ----------------------------------------------------------------------
  const filteredTeams = useMemo(() => {
    if (!query) return teams;
    const q = query.toLowerCase();
    return teams.filter(
      (team) =>
        team.name.toLowerCase().includes(q) ||
        team.lead?.name?.toLowerCase().includes(q)
    );
  }, [teams, query]);

  // ----------------------------------------------------------------------
  // Modal actions
  // ----------------------------------------------------------------------
  function openCreate() {
    setEditingTeam(null);
    setForm(emptyForm);
    setShowModal(true);
  }

  function openEdit(team) {
    setEditingTeam(team);
    setForm({
      name: team.name,
      lead: team.lead?._id || "",
      members: team.members ? team.members.map((m) => m._id) : [],
    });
    setShowModal(true);
  }

  async function submit(e) {
    e.preventDefault();
    try {
      if (editingTeam) {
        await api.put(`/teams/${editingTeam._id}`, form);
        toast.success("Team updated.");
      } else {
        await api.post("/teams", form);
        toast.success("Team created.");
      }
      setShowModal(false);
      setForm(emptyForm);
      loadData();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Unable to save team.");
    }
  }

  async function deleteTeam(id) {
    if (!window.confirm("Delete this team?")) return;
    try {
      await api.delete(`/teams/${id}`);
      toast.success("Team deleted.");
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Unable to delete team.");
    }
  }

  function toggleMember(id) {
    if (form.members.includes(id)) {
      setForm({
        ...form,
        members: form.members.filter((m) => m !== id),
      });
    } else {
      setForm({
        ...form,
        members: [...form.members, id],
      });
    }
  }

  // ----------------------------------------------------------------------
  // Render
  // ----------------------------------------------------------------------
  return (
    <div className="grid gap-6">
      {/* Header */}
      <PageHeader
        title="Teams"
        text="Organize employees into productive teams."
        action={
          isOwner && (
            <Button icon={FiPlus} onClick={openCreate}>
              Create Team
            </Button>
          )
        }
      />

      {/* Search */}
      <SearchBar
        value={query}
        onChange={setQuery}
        placeholder="Search teams..."
      />

      {/* Content */}
      {loading ? (
        <LoadingCards />
      ) : filteredTeams.length > 0 ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredTeams.map((team) => (
            <article
              key={team._id}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <FiUsers className="text-sky-600" />
                    <h3 className="text-xl font-black">{team.name}</h3>
                  </div>
                  <p className="mt-2 text-sm text-slate-500">Team Lead</p>
                  <p className="font-semibold">
                    {team.lead?.name || "Unassigned"}
                  </p>
                </div>

                {isOwner && (
                  <div className="flex gap-1">
                    <button
                      className="rounded-lg p-2 transition hover:bg-slate-100 dark:hover:bg-slate-800"
                      onClick={() => openEdit(team)}
                      aria-label="Edit team"
                    >
                      <FiEdit2 />
                    </button>
                    <button
                      className="rounded-lg p-2 transition hover:bg-red-100 dark:hover:bg-red-900/30"
                      onClick={() => deleteTeam(team._id)}
                      aria-label="Delete team"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                )}
              </div>

              <div className="mt-6">
                <div className="flex justify-between text-sm">
                  <span>Members</span>
                  <span>{team.members?.length || 0}</span>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {team.members?.length ? (
                    team.members.map((member) => (
                      <div
                        key={member._id}
                        className="rounded-full bg-slate-100 px-3 py-1 text-xs dark:bg-slate-800"
                      >
                        {member.name}
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-slate-400">No members assigned.</p>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : query ? (
        <NoSearchResults query={query} />
      ) : (
        <EmptyState onCreate={isOwner ? openCreate : null} />
      )}

      {/* Modal */}
      {showModal && (
        <TeamModal
          users={users}
          form={form}
          setForm={setForm}
          submit={submit}
          editing={editingTeam}
          close={() => setShowModal(false)}
          toggleMember={toggleMember}
        />
      )}
    </div>
  );
}

// ----------------------------------------------------------------------
// Team Modal
// ----------------------------------------------------------------------
function TeamModal({
  users,
  form,
  setForm,
  submit,
  editing,
  close,
  toggleMember,
}) {
  const [search, setSearch] = useState("");

  const filteredUsers = useMemo(() => {
    if (!search) return users;
    const q = search.toLowerCase();
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q)
    );
  }, [users, search]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-3xl rounded-2xl bg-white shadow-2xl dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-200 p-6 dark:border-slate-800">
          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">
              {editing ? "Edit Team" : "Create Team"}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Assign a lead and team members.
            </p>
          </div>
          <button
            onClick={close}
            className="rounded-lg p-2 transition hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Close modal"
          >
            <FiX size={20} />
          </button>
        </div>

        <form onSubmit={submit} className="space-y-6 p-6">
          {/* Team name */}
          <div>
            <label className="mb-2 block text-sm font-semibold">
              Team Name
            </label>
            <input
              required
              value={form.name}
              onChange={(e) =>
                setForm({
                  ...form,
                  name: e.target.value,
                })
              }
              className="w-full rounded-xl border border-slate-300 bg-transparent p-3 outline-none focus:border-sky-500 dark:border-slate-700 dark:text-white"
              placeholder="e.g. Frontend Team"
            />
          </div>

          {/* Team Lead */}
          <div>
            <label className="mb-2 block text-sm font-semibold">
              Team Lead
            </label>
            <select
              value={form.lead}
              onChange={(e) =>
                setForm({
                  ...form,
                  lead: e.target.value,
                })
              }
              className="w-full rounded-xl border border-slate-300 bg-transparent p-3 dark:border-slate-700 dark:text-white"
            >
              <option value="">Select Lead</option>
              {users.map((user) => (
                <option key={user._id} value={user._id}>
                  {user.name} ({user.role})
                </option>
              ))}
            </select>
          </div>

          {/* Members */}
          <div>
            <label className="mb-3 block text-sm font-semibold">
              Team Members
            </label>
            <div className="relative">
              <FiSearch className="absolute left-3 top-3 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search employee..."
                className="w-full rounded-xl border border-slate-300 bg-transparent py-3 pl-10 pr-4 dark:border-slate-700 dark:text-white"
              />
            </div>
            <div className="mt-4 max-h-72 overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-800">
              {filteredUsers.length === 0 && (
                <div className="p-4 text-center text-sm text-slate-500">
                  No users found.
                </div>
              )}
              {filteredUsers.map((employee) => {
                const selected = form.members.includes(employee._id);
                return (
                  <div
                    key={employee._id}
                    onClick={() => toggleMember(employee._id)}
                    className={`flex cursor-pointer items-center justify-between border-b border-slate-100 p-4 transition hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800 ${
                      selected ? "bg-sky-50 dark:bg-slate-800" : ""
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {employee.avatar ? (
                        <img
                          src={employee.avatar}
                          alt=""
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-600 font-bold text-white">
                          {employee.name.charAt(0)}
                        </div>
                      )}
                      <div>
                        <h4 className="font-semibold text-slate-900 dark:text-white">
                          {employee.name}
                        </h4>
                        <p className="text-xs text-slate-500">{employee.email}</p>
                      </div>
                    </div>
                    {selected && (
                      <FiCheck className="text-green-600" size={22} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={close}>
              Cancel
            </Button>
            <Button type="submit">{editing ? "Update Team" : "Create Team"}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}