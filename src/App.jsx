import { createSignal, createResource, Show, For } from 'solid-js';
import './styles.css';

function App() {
  const [datasetteUrl, setDatasetteUrl] = createSignal('http://localhost:8001');
  const [selectedDatabase, setSelectedDatabase] = createSignal('');
  const [selectedTable, setSelectedTable] = createSignal('');
  const [currentPage, setCurrentPage] = createSignal(1);
  const [selectedDate, setSelectedDate] = createSignal('');

  const formattedUrl = () => {
    const url = datasetteUrl();
    return url.endsWith('/') ? url : `${url}/`;
  };

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

  const [tableData] = createResource(
    () => selectedTable() && `${formattedUrl()}${selectedDatabase()}/${selectedTable()}?created=${selectedDate()}`,
    async (url) => {
      if (!url) return null;
      try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Failed to fetch table data: ${response.statusText}`);
        const data = await response.json();
        return data;
      } catch (error) {
        console.error('Error fetching table data:', error);
        const responseText = await error.response.text(); // Log the response text for debugging
        console.error('Response text:', responseText);
        return null;
      }
    }
  );

  const displayedRows = () => {
    const rows = tableData()?.rows || [];
    const startIndex = (currentPage() - 1);
    return rows[startIndex] ? [rows[startIndex]] : [];
  };

  return (
    <div class="container">
      <h1 class="title">SolidJS Datasette Integration</h1>
      
      <div class="box">
        <h2 class="subtitle">Datasette Integration</h2>
        
        <div class="field">
          <label class="label">Datasette URL:</label>
          <div class="control">
            <input 
              class="input" 
              type="text" 
              value={datasetteUrl()} 
              onInput={(e) => setDatasetteUrl(e.target.value)}
              placeholder="http://localhost:8001"
            />
          </div>
        </div>

        <div class="field">
          <label class="label">Database:</label>
          <div class="control">
            <div class="select">
              <select 
                value={selectedDatabase()} 
                onChange={(e) => {
                  setSelectedDatabase(e.target.value);
                  setSelectedTable('');
                  setCurrentPage(1);
                }}
              >
                <option value="">Select a database</option>
                <Show when={databases()}>
                  <For each={databases()}>
                    {(db) => <option value={db}>{db}</option>}
                  </For>
                </Show>
              </select>
            </div>
          </div>
        </div>

        <Show when={selectedDatabase()}>
          <div class="field">
            <label class="label">Table:</label>
            <div class="control">
              <div class="select">
                <select 
                  value={selectedTable()} 
                  onChange={(e) => {
                    setSelectedTable(e.target.value);
                    setCurrentPage(1);
                  }}
                >
                  <option value="">Select a table</option>
                  <Show when={tables()}>
                    <For each={tables()}>
                      {(table) => <option value={table}>{table}</option>}
                    </For>
                  </Show>
                </select>
              </div>
            </div>
          </div>
        </Show>

        <Show when={tableData()}>
          <div class="field">
            <label class="label">Filter by Date:</label>
            <div class="control">
              <input 
                class="input" 
                type="date" 
                onInput={(e) => setSelectedDate(e.target.value)} 
              />
            </div>
          </div>
          <div class="table-container">
            <h3 class="subtitle">Table Data: {selectedTable()}</h3>
            <div class="max-height">
              <div class="jump-to-page">
                <label>Jump to page:</label>
                <input 
                  class="input" 
                  type="number" 
                  min={1} 
                  onInput={(e) => setCurrentPage(Number(e.target.value))} 
                  placeholder="Page"
                />
                <button class="button" onClick={() => setCurrentPage(1)}>1</button>
                <button class="button" onClick={() => setCurrentPage(10)}>10</button>
                <button class="button" onClick={() => setCurrentPage(100)}>100</button>
              </div>
              <Show when={displayedRows().length > 0}>
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
                    <For each={displayedRows()}>
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
              <Show when={displayedRows().length === 0}>
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
