{
  description = "Monorepo Development Environment";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = import nixpkgs {
          inherit system;
          config = {
            allowUnfree = true;
          };
        };

        # PostgreSQL data directory
        pgDataDir = ".postgres-data";

        # PostgreSQL configuration
        postgresConf = pkgs.writeText "postgresql.conf" ''
          unix_socket_directories = '${pgDataDir}'
          listen_addresses = 'localhost'
          port = 43891
        '';

        # Script to initialize PostgreSQL
        initPostgres = pkgs.writeShellScriptBin "init-postgres" ''
          set -e

          if [ -d "${pgDataDir}" ]; then
            echo "✅ PostgreSQL data directory already exists"
          else
            echo "📦 Initializing PostgreSQL database..."
            ${pkgs.postgresql_14}/bin/initdb -D ${pgDataDir} -U postgres --no-locale --encoding=UTF8
            echo "✅ PostgreSQL initialized"
          fi
        '';

        # Script to start PostgreSQL
        startPostgres = pkgs.writeShellScriptBin "start-postgres" ''
          set -e

          if [ ! -d "${pgDataDir}" ]; then
            echo "❌ PostgreSQL not initialized. Run: init-postgres"
            exit 1
          fi

          if ${pkgs.postgresql_14}/bin/pg_ctl -D ${pgDataDir} status > /dev/null 2>&1; then
            echo "✅ PostgreSQL is already running"
          else
            echo "🚀 Starting PostgreSQL..."
            ${pkgs.postgresql_14}/bin/pg_ctl -D ${pgDataDir} -l ${pgDataDir}/logfile -o "-c config_file=${postgresConf}" start
            sleep 2
            echo "✅ PostgreSQL started on localhost:43891"
            echo "   Connection: postgresql://postgres@localhost:43891/postgres"
          fi
        '';

        # Script to stop PostgreSQL
        stopPostgres = pkgs.writeShellScriptBin "stop-postgres" ''
          set -e

          if ${pkgs.postgresql_14}/bin/pg_ctl -D ${pgDataDir} status > /dev/null 2>&1; then
            echo "🛑 Stopping PostgreSQL..."
            ${pkgs.postgresql_14}/bin/pg_ctl -D ${pgDataDir} stop
            echo "✅ PostgreSQL stopped"
          else
            echo "ℹ️  PostgreSQL is not running"
          fi
        '';

        # Script to access PostgreSQL shell
        postgresShell = pkgs.writeShellScriptBin "pg-shell" ''
          ${pkgs.postgresql_14}/bin/psql -h localhost -p 43891 -U postgres "$@"
        '';

        # pnpm aliases as executable scripts
        pnpmAliases = pkgs.symlinkJoin {
          name = "pnpm-aliases";
          paths = [
            (pkgs.writeShellScriptBin "p" ''exec pnpm "$@"'')
          ];
        };

        # terraform alias for infrastructure directory
        terraformAlias = pkgs.writeShellScriptBin "tf" ''
          exec terraform -chdir="./infrastructure" "$@"
        '';

        # Combined setup script
        setupScript = pkgs.writeShellScriptBin "setup-dev" ''
          set -e

          echo "╔══════════════════════════════════════════════════════════════╗"
          echo "║                                                              ║"
          echo "║   🚀 Development Environment Setup                          ║"
          echo "║                                                              ║"
          echo "╚══════════════════════════════════════════════════════════════╝"
          echo ""

          # Initialize PostgreSQL if needed
          if [ ! -d "${pgDataDir}" ]; then
            echo "📦 Step 1/5: Initializing PostgreSQL..."
            init-postgres
          else
            echo "✅ Step 1/5: PostgreSQL already initialized"
          fi

          # Start PostgreSQL
          echo ""
          echo "🚀 Step 2/5: Starting PostgreSQL..."
          start-postgres

          # Database is already created by PostgreSQL init (postgres database)
          echo ""
          echo "📊 Step 3/5: Database ready..."
          echo "   ✅ Using postgres database (default)"

          # Copy env files if they don't exist
          echo ""
          echo "⚙️  Step 4/5: Setting up environment files..."
          [ ! -f .env ] && cp .env.example .env && echo "   ✅ Created .env" || echo "   ✅ .env already exists"
          [ ! -f apps/backend/.env ] && cp apps/backend/.env.example apps/backend/.env && echo "   ✅ Created apps/backend/.env" || echo "   ✅ apps/backend/.env exists"
          [ ! -f apps/web/.env ] && cp apps/web/.env.example apps/web/.env && echo "   ✅ Created apps/web/.env" || echo "   ✅ apps/web/.env exists"
          [ ! -f apps/admin/.env ] && cp apps/admin/.env.example apps/admin/.env && echo "   ✅ Created apps/admin/.env" || echo "   ✅ apps/admin/.env exists"
          [ ! -f apps/mobile/.env ] && cp apps/mobile/.env.example apps/mobile/.env && echo "   ✅ Created apps/mobile/.env" || echo "   ✅ apps/mobile/.env exists"

          # Install dependencies if needed
          echo ""
          echo "📦 Step 5/5: Installing dependencies..."
          if [ ! -d "node_modules" ]; then
            pnpm install
          else
            echo "   ✅ Dependencies already installed (run 'pnpm install' to update)"
          fi

          echo ""
          echo "╔══════════════════════════════════════════════════════════════╗"
          echo "║                                                              ║"
          echo "║   ✅ Setup Complete!                                         ║"
          echo "║                                                              ║"
          echo "╚══════════════════════════════════════════════════════════════╝"
          echo ""
          echo "🎯 Next steps:"
          echo ""
          echo "   1. Run database migrations:"
          echo "      pnpm db:generate"
          echo "      pnpm db:migrate"
          echo "      pnpm db:seed"
          echo ""
          echo "   2. Start development:"
          echo "      pnpm dev"
          echo ""
          echo "📚 Available commands:"
          echo "   pnpm infra        - Start all infrastructure"
          echo "   pnpm infra:stop   - Stop all infrastructure"
          echo "   pnpm db:generate  - Generate database migrations"
          echo "   pnpm db:migrate   - Run database migrations"
          echo "   pnpm db:seed      - Seed database with data"
          echo "   pnpm dev          - Start all applications"
          echo ""
          echo "💡 Low-level commands (usually not needed):"
          echo "   start-postgres    - Start PostgreSQL server"
          echo "   stop-postgres     - Stop PostgreSQL server"
          echo "   psql-shell        - Open PostgreSQL shell"
          echo ""
          echo "🌐 URLs (after running 'pnpm dev'):"
          echo "   Marketing:  http://localhost:43892"
          echo "   Web:        http://localhost:43893"
          echo "   Admin:      http://localhost:43894"
          echo "   Backend:    http://localhost:43895"
          echo "   Storybook:  http://localhost:43896"
          echo ""
        '';

        # Local infrastructure script (for running outside nix shell)
        localInfra = pkgs.writeShellApplication {
          name = "local-infra";
          runtimeInputs = with pkgs; [ postgresql_14 ];
          text = ''
            # Initialize DB if required
            DIR="$PWD/${pgDataDir}"
            if [ ! -f "$DIR/PG_VERSION" ]; then
              echo "📦 Initializing PostgreSQL database..."
              ${pkgs.postgresql_14}/bin/initdb -D "$DIR" -U postgres --no-locale --encoding=UTF8
              echo "✅ PostgreSQL initialized"
            fi

            # Check if already running
            if ${pkgs.postgresql_14}/bin/pg_ctl -D "$DIR" status > /dev/null 2>&1; then
              echo "✅ PostgreSQL is already running on localhost:43891"
            else
              # Start postgres server as daemon
              echo "🚀 Starting PostgreSQL on localhost:43891..."
              ${pkgs.postgresql_14}/bin/pg_ctl -D "$DIR" -l "$DIR/logfile" -o "-c listen_addresses=localhost -p 43891" start
              sleep 2
              echo "✅ PostgreSQL started in background"
              echo "   Connection: postgresql://postgres@localhost:43891/postgres"
              echo "   Stop with: pnpm infra:stop"
            fi
          '';
        };

      in
      {
        devShells.default = pkgs.mkShell {
          buildInputs = with pkgs; [
            # Node.js ecosystem
            nodejs_20
            nodePackages.pnpm

            # Database
            postgresql_14

            # Development tools
            git
            terraform

            # Expo/React Native (optional, for mobile development)
            watchman

            # Notifications (macOS)
            terminal-notifier

            # Custom scripts
            initPostgres
            startPostgres
            stopPostgres
            postgresShell
            setupScript
            pnpmAliases
            terraformAlias

            uv
            pnpm
            pgcli
          ];

          shellHook = ''
            echo "╔══════════════════════════════════════════════════════════════╗"
            echo "║                                                              ║"
            echo "║   🚀 Development Environment                                ║"
            echo "║                                                              ║"
            echo "║   Node.js:     $(node --version)"
            echo "║   pnpm:        $(pnpm --version)"
            echo "║   PostgreSQL:  ${pkgs.postgresql_14.version}"
            echo "║   Terraform:   $(terraform --version | head -n1 | cut -d' ' -f2)"
            echo "║                                                              ║"
            echo "╚══════════════════════════════════════════════════════════════╝"
            echo ""

            # Check if this is first time setup
            if [ ! -d "${pgDataDir}" ] || [ ! -d "node_modules" ]; then
              echo "🎯 First time setup detected!"
              echo ""
              echo "Run this command to set everything up:"
              echo "  setup-dev"
              echo ""
            else
              # Check if PostgreSQL is running
              if ${pkgs.postgresql_14}/bin/pg_ctl -D ${pgDataDir} status > /dev/null 2>&1; then
                echo "✅ PostgreSQL is running"
              else
                echo "⚠️  PostgreSQL is not running"
                echo ""
                echo "Start it with:"
                echo "  start-postgres"
              fi
              echo ""
            fi

            echo "📚 Quick commands:"
            echo "  setup-dev       - Complete development setup (first time)"
            echo "  start-postgres  - Start PostgreSQL"
            echo "  stop-postgres   - Stop PostgreSQL"
            echo "  pnpm dev        - Start all applications"
            echo ""

            # Set environment variables
            export POSTGRES_PORT=43891
            export BACKEND_PORT=43895
            export MARKETING_PORT=43892
            export WEB_PORT=43893
            export ADMIN_PORT=43894
            export STORYBOOK_PORT=43896
            export PGDATA="${pgDataDir}"

            # Database configuration
            export DB_HOST=localhost
            export DB_PORT=43891
            export DB_NAME=postgres
            export DB_USER=postgres
            export DB_PASSWORD=postgres
          '';
        };

        # Packages for running outside dev shell
        packages = {
          # Use `nix run .#infra` to run a local instance of postgres
          infra = localInfra;
        };
      }
    );
}
