import { createSignal, createResource, Show, For } from 'solid-js';
import './styles.css';

function App() {
  const [count, setCount] = createSignal(0);
  const [name, setName] = createSignal('SolidJS');
  const [datasetteUrl, setDatasetteUrl] = createSignal('http://localhost:8001');
  const [selectedDatabase, setSelectedDatabase] = createSignal('');
  const [selectedTable, setSelectedTable] = createSignal('');
  const [currentPage, setCurrentPage] = createSignal(1);

  // Ensure the URL ends with a slash
  const formattedUrl = () => {
    const url = datasetteUrl();
    return url.endsWith('/') ? url : `${url}/`;
  };

  // Fetch databases from Datasette
  const [databases] = createResource(
    formattedUrl,
    async (url) => {
      try {
        const response = await fetch(`${url}.json`);
        if (!response.ok) throw new Error(`Failed to fetch databases: ${response.statusText}`);
        const data = await response.json();
        return Object.keys(data);
      } catch (error) {
        console.error('Error fetching databases:', error);
        return [];
      }
    }
  );

  // Fetch tables from selected database
  const [tables] = createResource(
    () => selectedDatabase() && `${formattedUrl()}${selectedDatabase()}`,
    async (url) => {
      if (!url) return [];
      try {
        const response = await fetch(`${url}.json`);
        if (!response.ok) throw new Error(`Failed to fetch tables: ${response.statusText}`);
        const data = await response.json();
        return data.tables.map(table => table.name);
      } catch (error) {
        console.error('Error fetching tables:', error);
        return [];
      }
    }
  );

  // Fetch data from selected table
  const [tableData] = createResource(
    () => selectedTable() && `${formattedUrl()}${selectedDatabase()}/${selectedTable()}`,
    async (url) => {
      if (!url) return null;
      try {
        const response = await fetch(`${url}.json`);
        if (!response.ok) throw new Error(`Failed to fetch table data: ${response.statusText}`);
        const data = await response.json();
        return data;
      } catch (error) {
        console.error('Error fetching table data:', error);
        return null;
      }
    }
  );

  // Calculate the displayed row based on pagination
  const displayedRow = () => {
    const rows = tableData()?.rows || [];
    const startIndex = (currentPage() - 1);
    return rows[startIndex] ? [rows[startIndex]] : []; // Always return one row
  };

  return (
    <div class="container">
      <p>This is a SolidJS application with Datasette backend support.</p>
      
      <div class="card">
        <h2>Datasette Integration</h2>
        
        <div style="margin: 10px 0;">
          <label>Datasette URL:</label>
          <input 
            type="text" 
            value={datasetteUrl()} 
            onInput={(e) => setDatasetteUrl(e.target.value)}
            placeholder="http://localhost:8001"
            style="margin-left: 10px; width: 200px;"
          />
        </div>

        <div style="margin: 10px 0;">
          <label>Database:</label>
          <select 
            value={selectedDatabase()} 
            onChange={(e) => {
              setSelectedDatabase(e.target.value);
              setSelectedTable('');
              setCurrentPage(1); // Reset to first page when database changes
            }}
            style="margin-left: 10px;"
          >
            <option value="">Select a database</option>
            <Show when={databases()}>
              <For each={databases()}>
                {(db) => <option value={db}>{db}</option>}
              </For>
            </Show>
          </select>
        </div>

        <Show when={selectedDatabase()}>
          <div style="margin: 10px 0;">
            <label>Table:</label>
            <select 
              value={selectedTable()} 
              onChange={(e) => {
                setSelectedTable(e.target.value);
                setCurrentPage(1); // Reset to first page when table changes
              }}
              style="margin-left: 10px;"
            >
              <option value="">Select a table</option>
              <Show when={tables()}>
                <For each={tables()}>
                  {(table) => <option value={table}>{table}</option>}
                </For>
              </Show>
            </select>
          </div>
        </Show>

        <Show when={tableData()}>
          <div style="margin: 20px 0;">
            <h3>Table Data: {selectedTable()}</h3>
            <div style="max-height: 400px; overflow-y: auto; border: 1px solid #ddd; padding: 10px;">
              <div class="jump-to-page">
                <label>Jump to page:</label>
                <input 
                  type="number" 
                  min={1} 
                  onInput={(e) => setCurrentPage(Number(e.target.value))} 
                  style="margin-left: 10px; width: 50px;"
                  placeholder="Page"
                />
                <button onClick={() => setCurrentPage(1)} style="margin-left: 10px;">1</button>
                <button onClick={() => setCurrentPage(10)} style={{ marginLeft: '10px' }}>10</button>
                <button onClick={() => setCurrentPage(100)} style={{ marginLeft: '10px' }}>100</button>
              </div>
              <Show when={displayedRow().length > 0}>
                <table class="table">
                  <thead>
                    <tr>
                      <For each={tableData().columns}>
                        {(column) => (
                          <th>
                            {column}
                          </th>
                        )}
                      </For>
                    </tr>
                  </thead>
                  <tbody>
                    <For each={displayedRow()}>
                      {(row) => (
                        <tr>
                          <For each={row}>
                            {(cell) => (
                              <td>
                                {String(cell)}
                              </td>
                            )}
                          </For>
                        </tr>
                      )}
                    </For>
                  </tbody>
                </table>
              </Show>
              <Show when={displayedRow().length === 0}>
                <p>No data found in this table.</p>
              </Show>
            </div>
          </div>
        </Show>

        <Show when={databases.loading}>
          <p>Loading databases...</p>
        </Show>
        <Show when={tables.loading}>
          <p>Loading tables...</p>
        </Show>
        <Show when={tableData.loading}>
          <p>Loading table data...</p>
        </Show>
      </div>
    </div>
  );
}

export default App;
