#! /usr/bin/env bash

set -e
set -x

cd backend
python -c "import app.api; import json; print(json.dumps(app.api.app.openapi()))" > ../openapi.json
cd ..
mv openapi.json frontend/
cd frontend
npm run generate-client
npx biome format --write ./src/client
