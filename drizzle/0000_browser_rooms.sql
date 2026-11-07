CREATE TABLE hv_rooms (id TEXT PRIMARY KEY, pin TEXT NOT NULL UNIQUE, owner_hash TEXT NOT NULL, created INTEGER NOT NULL, expires INTEGER NOT NULL, host_instance TEXT NOT NULL DEFAULT '', host_seen INTEGER NOT NULL DEFAULT 0, active TEXT NOT NULL DEFAULT '{}', public_state TEXT NOT NULL DEFAULT '{}', signal TEXT NOT NULL DEFAULT '{}', hidden TEXT NOT NULL DEFAULT '[]', revision INTEGER NOT NULL DEFAULT 0);
--> statement-breakpoint
CREATE TABLE hv_seats (room TEXT NOT NULL, seat INTEGER NOT NULL, token_hash TEXT NOT NULL UNIQUE, seen INTEGER NOT NULL, sequence INTEGER NOT NULL DEFAULT -1, mask INTEGER NOT NULL DEFAULT 0, PRIMARY KEY(room,seat));
--> statement-breakpoint
CREATE TABLE hv_events (id INTEGER PRIMARY KEY AUTOINCREMENT, room TEXT NOT NULL, game TEXT NOT NULL, seat INTEGER NOT NULL, kind TEXT NOT NULL, payload TEXT NOT NULL, created INTEGER NOT NULL);
--> statement-breakpoint
CREATE INDEX hv_events_room ON hv_events(room,game,kind,id);
--> statement-breakpoint
CREATE TABLE hv_values (room TEXT NOT NULL, key TEXT NOT NULL, value TEXT NOT NULL, PRIMARY KEY(room,key));
--> statement-breakpoint
CREATE TABLE hv_limits (key TEXT PRIMARY KEY, started INTEGER NOT NULL, count INTEGER NOT NULL);
--> statement-breakpoint
CREATE TABLE hv_sockets (room TEXT NOT NULL, id TEXT NOT NULL, seat INTEGER NOT NULL, PRIMARY KEY(room,id));
--> statement-breakpoint
CREATE TABLE hv_socket_messages (id INTEGER PRIMARY KEY AUTOINCREMENT, room TEXT NOT NULL, socket TEXT NOT NULL, payload TEXT NOT NULL);
--> statement-breakpoint
CREATE INDEX hv_socket_inbox ON hv_socket_messages(room,socket,id);
