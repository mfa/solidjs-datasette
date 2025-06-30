import { createSignal, createResource, Show, For } from 'solid-js';

function App() {
  const [count, setCount] = createSignal(0);
  const [name, setName] = createSignal('SolidJS');
  const [datasetteUrl, setDatasetteUrl] = createSignal('http://localhost:8001');
  const [selectedDatabase, setSelectedDatabase] = createSignal('');
  const [selectedTable, setSelectedTable] = createSignal('');
  const [pageSize, setPageSize] = createSignal(1); // Default to show 1 row
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

  // Calculate the displayed rows based on pagination
  const displayedRows = () => {
    const rows = tableData()?.rows || [];
    const startIndex = (currentPage() - 1) * pageSize();
    return rows.slice(startIndex, startIndex + pageSize());
  };

  return (
    <div style="padding: 20px; font-family: Arial, sans-serif;">
      <p>This is a SolidJS application with Datasette backend support.</p>
      
      <div style="margin: 20px 0; padding: 20px; border: 1px solid #ccc; border-radius: 5px;">
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
              <Show when={displayedRows().length > 0}>
                <table style="width: 100%; border-collapse: collapse;">
                  <thead>
                    <tr>
                      <For each={tableData().columns}>
                        {(column) => (
                          <th style="border: 1px solid #ddd; padding: 8px; background-color: #f5f5f5;">
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
                              <td style="border: 1px solid #ddd; padding: 8px;">
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
            <div style="margin-top: 10px;">
              <label>Show:</label>
              <select onChange={(e) => setPageSize(Number(e.target.value))} style="margin-left: 10px;">
                <option value={1}>1</option>
                <option value={10}>10</option>
                <option value={100}>100</option>
              </select>
              <button onClick={() => setCurrentPage(1)} style="margin-left: 10px;">First</button>
              <button onClick={() => setCurrentPage(Math.max(1, currentPage() - 1))} style="margin-left: 10px;">Previous</button>
              <button onClick={() => setCurrentPage(currentPage() + 1)} style="margin-left: 10px;">Next</button>
              <button onClick={() => setCurrentPage(Math.ceil((tableData()?.rows.length || 1) / pageSize()))} style="margin-left: 10px;">Last</button>
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
