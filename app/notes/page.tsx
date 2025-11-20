"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Note = {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
};

export default function NotesPage() {
  const router = useRouter();
  const [notes, setNotes] = useState<Note[]>([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [user, setUser] = useState<string | null>(null);

  async function loadNotes() {
    setErrorMsg(null);
    setLoading(true);

    const { data, error } = await supabase
      .from("notes")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      setErrorMsg("Could not load notes.");
      setLoading(false);
      return;
    }

    setNotes(data ?? []);
    setLoading(false);
  }

  async function addNote() {
    setErrorMsg(null);

    if (!content.trim()) {
      setErrorMsg("Note cannot be empty.");
      return;
    }

    // Get the current user
    const {
      data: { user: currentUser },
    } = await supabase.auth.getUser();

    if (!currentUser) {
      setErrorMsg("You must be logged in to add notes.");
      return;
    }

    const { error } = await supabase.from("notes").insert({
      content,
      user_id: currentUser.id,
    });

    if (error) {
      console.error(error);
      setErrorMsg("Could not save note.");
      return;
    }

    setContent("");
    await loadNotes(); // refresh list
  }

  // Delete a note
  async function deleteNote(id: string) {
    const { error } = await supabase.from("notes").delete().eq("id", id);

    if (error) {
      console.error(error);
      setErrorMsg("Could not delete note.");
      return;
    }

    await loadNotes();
  }

  // Sign out
  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  // Load notes when the page first mounts
  useEffect(() => {
    // Check if user is logged in
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.push("/login");
      } else {
        setUser(user.email ?? null);
      }
    });

    // We DO want to call setState as a result of fetching external data.
    // This ESLint rule is overly strict for this case, so we disable it for this line.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadNotes();
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Navigation */}
      <nav className="border-b border-gray-200 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <svg
                className="h-8 w-8 text-indigo-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
              <span className="text-xl font-bold text-gray-900">
                SecureNotes
              </span>
            </Link>
            <div className="flex items-center gap-4">
              {user && <span className="text-sm text-gray-600">{user}</span>}
              <button
                onClick={handleSignOut}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                Sign out
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Notes</h1>
          <p className="mt-2 text-gray-600">
            Create and manage your secure notes
          </p>
        </div>

        {/* Add Note Form */}
        <div className="mb-8 rounded-xl bg-white p-6 shadow-lg border border-gray-100">
          <div className="space-y-4">
            <textarea
              placeholder="Write your note here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              className="block w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                {content.length > 0 && `${content.length} characters`}
              </div>
              <button
                onClick={addNote}
                disabled={loading || !content.trim()}
                className="rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                {loading ? "Adding..." : "Add Note"}
              </button>
            </div>
          </div>

          {errorMsg && (
            <div className="mt-4 rounded-lg bg-red-50 p-3 border border-red-200">
              <p className="text-sm text-red-800">{errorMsg}</p>
            </div>
          )}
        </div>

        {/* Notes List */}
        {loading && notes.length === 0 ? (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent"></div>
            <p className="mt-4 text-gray-600">Loading notes...</p>
          </div>
        ) : notes.length === 0 ? (
          <div className="text-center py-12 rounded-xl bg-white border border-gray-100">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              No notes yet
            </h3>
            <p className="mt-2 text-gray-500">
              Get started by creating your first note above.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {notes.map((note: Note) => (
              <div
                key={note.id}
                className="rounded-xl bg-white p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow group">
                <div className="flex items-start justify-between gap-4">
                  <p className="flex-1 text-gray-900 whitespace-pre-wrap break-words">
                    {note.content}
                  </p>
                  <button
                    onClick={() => deleteNote(note.id)}
                    className="flex-shrink-0 text-gray-400 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100"
                    title="Delete note">
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
                <p className="mt-4 text-xs text-gray-500">
                  {new Date(note.created_at).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}