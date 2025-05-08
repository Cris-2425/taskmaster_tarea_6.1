import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  Menu,
  Bell,
  Settings,
  Grid,
  Calendar,
  User,
  Edit2,
  Trash2,
  List,
  Layout
} from 'lucide-react';


// 1. Datos de ejemplo con dueDate y categoría.

const defaultTasks = [
  { id: 1, title: 'Trabajo Contornos 6.1', priority: 'Alta', status: 'ter',  dueDate: '2025-05-11T23:59', category: 'Contornos' },
  { id: 2, title: 'Trabajo Contornos 6.2', priority: 'Alta', status: 'sin', dueDate: '2025-05-11T23:59', category: 'Contornos' },
  { id: 3, title: 'Trabajo Contornos 6.3', priority: 'Alta', status: 'sin',  dueDate: '2025-05-11T23:59', category: 'Contornos' },
  { id: 4, title: 'Página HTML Marcas',     priority: 'Alta', status: 'ter',  dueDate: '2025-05-13T23:59', category: 'Marcas' },
  { id: 5, title: 'Packet Tracer SI',       priority: 'Baja',  status: 'sin',  dueDate: '2025-05-14T23:59', category: 'Sistemas' },
  { id: 6, title: 'Contornos 7.1',          priority: 'Media',status: 'sin',  dueDate: '2025-05-25T23:59', category: 'Contornos' },
  { id: 7, title: 'Examen PRO Ficheros',    priority: 'Alta', status: 'prog', dueDate: '2025-05-19T23:59', category: 'Programación' },
  { id: 8, title: 'Examen PRO Bases',       priority: 'Alta', status: 'sin',  dueDate: '2025-05-26T23:59', category: 'Programación' },
  { id: 9, title: 'Examen Marcas',          priority: 'Baja',  status: 'ter',  dueDate: '2025-05-27T23:59', category: 'Marcas' },
  { id:10, title: 'Examen Contornos',       priority: 'Alta', status: 'prog', dueDate: '2025-05-28T23:59', category: 'Contornos' },
  { id:11, title: 'Examen BD',              priority: 'Baja',  status: 'sin',  dueDate: '2025-05-29T23:59', category: 'Bases de Datos' },
  { id:12, title: 'Examen SI',              priority: 'Baja',  status: 'sin',  dueDate: '2025-05-30T23:59', category: 'Sistemas Informáticos' }
];

function loadTasks() {
  const stored = localStorage.getItem('tasks');
  return stored ? JSON.parse(stored) : defaultTasks;
}

function saveTasks(tasks) {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

export default function App() {
  const [tasks, setTasks] = useState(loadTasks());
  const [view, setView] = useState('kanban');

  // 2. Persistencia en LocalStorage.
  useEffect(() => { saveTasks(tasks); }, [tasks]);

  // 3. Permiso y notificaciones automáticas.
  useEffect(() => { if ('Notification' in window) Notification.requestPermission(); }, []);
  useEffect(() => {
    tasks.forEach(task => {
      const diff = new Date(task.dueDate).getTime() - Date.now();
      if (diff > 0 && diff < 3600000) {
        setTimeout(() => { new Notification(`Tarea "${task.title}" vence en menos de 1 hora`); }, diff - 300000);
      }
    });
  }, [tasks]);

  // 4. Handlers CRUD.
  const addTask = status => {
    const title = prompt('Título de la tarea:'); if (!title) return;
    const priority = prompt('Prioridad (Alta, Media, Baja):', 'Media');
    const dueDate = prompt('Fecha límite (YYYY-MM-DDTHH:MM):', new Date().toISOString().slice(0,16));
    const category = prompt('Categoría:', 'General');
    setTasks(prev => [...prev, { id: Date.now(), title, priority, status, dueDate, category }]);
  };
  const editTask = task => {
    const title = prompt('Editar título:', task.title); if (title==null) return;
    const priority = prompt('Editar prioridad:', task.priority);
    const dueDate = prompt('Editar fecha límite:', task.dueDate);
    const category = prompt('Editar categoría:', task.category);
    setTasks(prev => prev.map(x => x.id===task.id?{...x,title,priority,dueDate,category}:x));
  };
  const deleteTask = id => { if (confirm('¿Eliminar esta tarea?')) setTasks(prev => prev.filter(x=>x.id!==id)); };
  const toggleComplete = id => { setTasks(prev => prev.map(x=>x.id===id?{...x,status:x.status==='ter'?'sin':'ter'}:x)); };

  // 5. Cálculo de datos para gráficos.
  const priorityColors = { Alta:'bg-red-500', Media:'bg-yellow-500', Baja:'bg-green-500' };
  const priorityChart = ['Alta','Media','Baja'].map(key=>({ name:key.charAt(0).toUpperCase()+key.slice(1), count:tasks.filter(x=>x.priority===key).length }));
  const completionChart = [ {name:'Completadas',value:tasks.filter(x=>x.status==='ter').length}, {name:'Pendientes',value:tasks.length - tasks.filter(x=>x.status==='ter').length} ];
  const COLORS = ['#6366F1','#A78BFA'];

  // 6. Configuración columnas Kanban.
  const columns = [ {key:'sin',title:'Sin Empezar'}, {key:'prog',title:'En Progreso'}, {key:'ter',title:'Terminadas'} ];

  // 7. Próximos vencimientos.
  const upcoming = tasks.filter(x=>x.status!=='ter').sort((a,b)=>new Date(a.dueDate)-new Date(b.dueDate)).slice(0,3);

  // 8. Eficiencia.
  const total = tasks.length; const doneCount = tasks.filter(x=>x.status==='ter').length;
  const efficiency = total>0?Math.round((doneCount/total)*100):0;

  	  // En que cada caso he estado usando utilidades de Tailwind CSS. Ejemplo:
	  // flex-1 = flex-grow: 1 (Ocupar espacio disponible).
	  // p-6 = padding: 1.5 rem.
	  // space-y-6 = 1.5 rem.
    
  return (
    <div className="min-h-screen flex bg-gradient-to-br from-gray-900 to-purple-900 text-gray-100">
      <nav className="w-16 bg-gray-800 flex flex-col items-center py-6 space-y-6">
        {[Menu,Grid,Calendar,Bell,Settings].map((Icon,i)=><Icon key={i} size={20} className="opacity-50 hover:opacity-100 cursor-pointer"/>)}
      </nav>

      <main className="flex-1 p-6 space-y-6 overflow-auto">
        <header className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Tareas 1º DAM</h1>
          <div className="flex space-x-2">
            <button onClick={()=>setView('kanban')} className={view==='kanban'?'bg-gray-700 p-2 rounded':'bg-gray-800 p-2 rounded'}><Layout size={20}/></button>
            <button onClick={()=>setView('list')}  className={view==='list'?  'bg-gray-700 p-2 rounded':'bg-gray-800 p-2 rounded'}><List size={20}/></button>
          </div>
        </header>
        {view==='kanban'?(
          <div className="flex space-x-6">
            <div className="grid grid-cols-3 gap-6 flex-1">
              {columns.map(col=>(<div key={col.key} className="bg-gray-800 rounded-lg p-4 flex flex-col h-[70vh]">
                <h3 className="text-lg font-semibold mb-4">{col.title}</h3>
                <div className="flex-1 overflow-y-auto space-y-3">
                  {tasks.filter(x=>x.status===col.key).map(task=>(<div key={task.id} className={`${priorityColors[task.priority]} p-3 rounded-lg space-y-1`}>
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">{task.title}</span>
                      <div className="flex space-x-1">
                        <button onClick={()=>toggleComplete(task.id)} title="Toggle Complete"><Bell size={14}/></button>
                        <button onClick={()=>editTask(task)} title="Editar"><Edit2 size={14}/></button>
                        <button onClick={()=>deleteTask(task.id)} title="Eliminar"><Trash2 size={14}/></button>
                      </div>
                    </div>
                    <div className="text-xs opacity-75">Prioridad: {task.priority}</div>
                    <div className="text-xs opacity-75">Vence: {new Date(task.dueDate).toLocaleDateString()}</div>
                    <div className="text-xs opacity-75">Categoría: {task.category}</div>
                  </div>))}
                </div>
                <button onClick={()=>addTask(col.key)} className="mt-4 bg-blue-600 hover:bg-blue-500 py-1 px-3 rounded text-sm">+ Añadir</button>
              </div>))}
            </div>
            {/* Panel lateral de estadísticas */}
            <aside className="w-72 bg-gray-900 rounded-lg p-4 space-y-6">
              <div className="flex justify-between items-center">
                <div><div className="text-sm opacity-75">Usuario</div><div className="font-semibold">Cristian DAM</div></div>
                <User size={32}/>
              </div>
              <div><div className="text-xs opacity-75 mb-1">Tareas por prioridad</div>
                <ResponsiveContainer width="100%" height={100}><BarChart data={priorityChart}><XAxis dataKey="name" stroke="#888" style={{fontSize:10}}/><YAxis hide/><Tooltip/><Bar dataKey="count" fill="#6366F1"/></BarChart></ResponsiveContainer>
              </div>
              <div><div className="text-xs opacity-75 mb-1">% Completadas</div>
                <ResponsiveContainer width="100%" height={100}><PieChart><Pie data={completionChart} innerRadius={30} outerRadius={50} dataKey="value">{completionChart.map((_,i)=><Cell key={i} fill={COLORS[i]}/>)} </Pie></PieChart></ResponsiveContainer>
              </div>
              <div><div className="text-xs opacity-75 mb-1">Próximos vencimientos</div>
                <ul className="space-y-1 text-sm">{upcoming.map(t=>(<li key={t.id} className="flex justify-between"><span>{t.title}</span><span className="opacity-75">{new Date(t.dueDate).toLocaleDateString()}</span></li>))}</ul>
              </div>
              <div><div className="text-xs opacity-75 mb-1">Eficiencia</div><div className="text-2xl font-bold">{efficiency}%</div></div> // Fórmula de Productividad.
            </aside>
          </div>
        ):(
          <div className="overflow-auto bg-gray-800 rounded-lg p-4">
            <table className="min-w-full table-auto">
              <thead><tr className="bg-gray-700">{['Título','Prioridad','Estado','Vence','Categoría','Acciones'].map(h=>(<th key={h} className="px-4 py-2 text-left text-sm font-semibold">{h}</th>))}</tr></thead>
              <tbody>{tasks.map(task=>(<tr key={task.id} className="border-t border-gray-700 hover:bg-gray-700">
                <td className="px-4 py-2">{task.title}</td>
                <td className="px-4 py-2">{task.priority}</td>
                <td className="px-4 py-2">{columns.find(c=>c.key===task.status)?.title}</td>
                <td className="px-4 py-2">{new Date(task.dueDate).toLocaleDateString()}</td>
                <td className="px-4 py-2">{task.category}</td>
                <td className="px-4 py-2 flex space-x-2"><button onClick={()=>toggleComplete(task.id)}><Bell size={14}/></button><button onClick={()=>editTask(task)}><Edit2 size={14}/></button><button onClick={()=>deleteTask(task.id)}><Trash2 size={14}/></button></td>
              </tr>))}</tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}

// He tenido que ayudarme de la IA para conseguir el estilo lo más parecido a la foto que mencionaste.
