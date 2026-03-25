import http.server
import socketserver
import os
import sys

PORT = 5500
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def log_message(self, format, *args):
        # Clean logs for the user
        sys.stderr.write("%s - - [%s] %s\n" %
                         (self.address_string(),
                          self.log_date_time_string(),
                          format%args))

if __name__ == "__main__":
    print("=" * 50)
    print(f"  ScholarAgent — Mock MahaDBT Portal Server")
    print(f"  Serving at: http://127.0.0.1:{PORT}/mock-mahadbt-portal.html")
    print("=" * 50)
    print("  (Keep this window open to use the portal)")
    
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nShutting down portal server...")
            httpd.server_close()
