export const algorithms = [
 {id:'bubble',name:'Bubble Sort',spanish:'Burbuja',level:'PRINCIPIANTE',group:'basic',color:'green',best:'O(n)',worst:'O(n²)',space:'O(1)',stable:'Sí',
 description:'Compara pares de elementos adyacentes e intercambia los que están desordenados, como burbujas que suben a la superficie.',
 analogy:'Como burbujas en un vaso de agua',detail:'Los elementos más grandes flotan hacia el final de la lista en cada pasada. Solo se comparan elementos vecinos.',
 rules:['Compara dos números vecinos.','Si el izquierdo es mayor, intercámbialos; si no, conserva el orden.','Repite la pasada hasta que no haya intercambios.'],
 use:'Para comprender comparaciones e intercambios en listas pequeñas.',
 code:['Repetir una pasada por la lista','Comparar vecinos A y B','Si A > B: intercambiar A y B','Si no hubo cambios: terminar'],
 preview:[25,43,61,32,68,14,54]},
 {id:'insertion',name:'Insertion Sort',spanish:'Inserción',level:'PRINCIPIANTE',group:'basic',color:'blue',best:'O(n)',worst:'O(n²)',space:'O(1)',stable:'Sí',
 description:'Construye la lista ordenada elemento por elemento, similar a organizar una mano de cartas de póker una tras otra.',
 analogy:'Ordenar las cartas de tu mano',detail:'Mantén ordenada la parte izquierda e inserta cada nuevo elemento en su posición. Esta versión lo desplaza mediante intercambios adyacentes.',
 rules:['Toma el siguiente elemento de la parte sin ordenar.','Compáralo con su vecino izquierdo e intercámbialos si es menor.','Continúa hacia la izquierda hasta colocarlo en su posición.'],
 use:'Listas pequeñas o casi ordenadas.',
 code:['Recorrer desde el segundo elemento','Comparar el elemento con su vecino izquierdo','Si es menor: intercambiar y retroceder','Continuar con el siguiente elemento'],
 preview:[22,36,50,29,65,18,47]},
 {id:'merge',name:'Merge Sort',spanish:'Mezcla',level:'INTERMEDIO',group:'advanced',color:'purple',best:'O(n log n)',worst:'O(n log n)',space:'O(n)',stable:'Sí',
 description:'Divide el arreglo a la mitad sucesivamente y luego combina las partes de forma ordenada mediante recursión.',
 analogy:'Unir dos filas ya ordenadas',detail:'Divide la lista en mitades hasta llegar a elementos individuales. Compara el primer elemento disponible de cada mitad y copia el menor a la lista de salida.',
 rules:['Divide la lista en dos mitades.','Ordena cada mitad de forma recursiva.','Mezcla ambas mitades tomando el menor elemento disponible.'],
 use:'Cuando necesitas estabilidad y tiempo predecible.',
 code:['Dividir el intervalo en mitades','Ordenar ambas mitades','Comparar sus primeros valores disponibles','Copiar el menor desde la memoria auxiliar'],
 preview:[20,35,48,60,24,42,55]},
 {id:'quick',name:'Quick Sort',spanish:'Rápido',level:'INTERMEDIO +',group:'advanced',color:'blue',best:'O(n log n)',worst:'O(n²)',space:'O(log n) promedio; O(n) peor caso',stable:'No',
 description:'Selecciona un elemento pivote y particiona los demás en menores y mayores mediante intercambios en la propia lista.',
 analogy:'Separar una fila alrededor de un valor',detail:'Usamos el último elemento como pivote. Colocamos a su izquierda los valores menores o iguales, ubicamos el pivote y repetimos sobre cada lado.',
 rules:['Elige el último elemento como pivote.','Agrupa los menores o iguales a la izquierda y coloca el pivote.','Ordena recursivamente los dos lados.'],
 use:'Ordenamiento general; evita particiones muy desequilibradas.',
 code:['Seleccionar el último elemento como pivote','Comparar cada valor con el pivote','Intercambiar para formar las particiones','Repetir en los subarreglos'],
 preview:[22,14,29,43,54,61,68]}
];
const question = (id,algorithm,purpose,prompt,options,answer,explanation,values=[15,42,8,23,50]) =>
 ({id,algorithm,purpose,prompt,options,answer,explanation,values});
export const questions = [
 question('d1','bubble','diagnostic','¿Qué elementos compara Bubble Sort?',['Elementos vecinos','Solo el primero y el último','Siempre los dos mayores'],0,'Bubble Sort compara elementos adyacentes.'),
 question('d2','insertion','diagnostic','¿Qué parte mantiene ordenada Insertion Sort?',['Ninguna hasta finalizar','Un prefijo que crece','Solo el último elemento'],1,'El prefijo izquierdo permanece ordenado mientras se insertan nuevos elementos.'),
 question('d3','quick','diagnostic','¿Qué algoritmo particiona la lista alrededor de un pivote?',['Merge Sort','Bubble Sort','Quick Sort'],2,'Quick Sort separa valores alrededor de un pivote.'),
 question('d4','merge','diagnostic','¿Qué hace Merge Sort después de ordenar las dos mitades?',['Las mezcla en orden','Las invierte','Descarta los duplicados'],0,'Mezcla las mitades tomando el menor valor disponible.'),
 question('d5','bubble','diagnostic','Al comparar 42 y 8 en orden ascendente, ¿qué corresponde?',['Dejarlos iguales','Intercambiarlos','Eliminar el 42'],1,'42 es mayor que 8; el intercambio local coloca 8 antes de 42.'),
 question('d6','quick','diagnostic','¿Cuál es el peor tiempo de Quick Sort con particiones muy desequilibradas?',['O(1)','O(n log n)','O(n²)'],2,'Una partición desequilibrada repetida produce trabajo cuadrático.'),
 question('f1','bubble','final','En [7, 2, 5], ¿cómo queda la lista tras el primer intercambio de Bubble Sort?',['[2, 7, 5]','[2, 5, 7]','[7, 5, 2]'],0,'El primer intercambio solo afecta a los vecinos 7 y 2.'),
 question('f2','insertion','final','El prefijo [2, 6] está ordenado y llega 4. ¿Cuál es el nuevo prefijo?',['[4, 2, 6]','[2, 4, 6]','[2, 6, 4]'],1,'4 se inserta entre 2 y 6.'),
 question('f3','quick','final','En esta versión de Quick Sort, ¿qué valor es pivote para [9, 2, 5]?',['9','2','5'],2,'La versión implementada elige el último elemento.'),
 question('f4','merge','final','Al mezclar [1, 7] y [3, 5], ¿cuál es el resultado?',['[1, 3, 5, 7]','[1, 7, 3, 5]','[3, 5, 1, 7]'],0,'Se selecciona sucesivamente el menor de las dos mitades.'),
 question('f5','merge','final','¿Qué memoria auxiliar usa Merge Sort sobre arreglos en esta implementación?',['O(1)','O(n)','O(n²)'],1,'Las mitades auxiliares requieren espacio lineal.'),
 question('f6','quick','final','Si siempre se elige un pivote extremo, ¿qué puede ocurrir?',['Siempre tarda O(1)','Elimina duplicados','El tiempo puede crecer hasta O(n²)'],2,'Las particiones de tamaño 0 y n−1 repetidas provocan el peor caso.'),
 question('e-bubble','bubble','exercise','El algoritmo compara 42 y 8. ¿Qué acción corresponde realizar?',['Intercambiar 42 con 8 porque 42 > 8','Dejar los números como están y avanzar','Mover el 50 al inicio del arreglo'],0,'Como 42 es mayor que 8, Bubble Sort los intercambia. El estado siguiente es [15, 8, 42, 23, 50].'),
 question('e-insertion','insertion','exercise','El prefijo [2, 6] está ordenado. ¿Dónde insertas 4?',['Después del 6','Entre 2 y 6','Antes del 2'],1,'El 4 se desplaza a la izquierda de 6 y queda después de 2: [2, 4, 6].',[2,6,4]),
 question('e-merge','merge','exercise','Estás mezclando [2, 7] y [3, 5]. ¿Qué valor copias primero?',['7','3','2'],2,'Compara los primeros valores 2 y 3. El menor, 2, se copia primero.',[2,7,3,5]),
 question('e-quick','quick','exercise','Con pivote 5 en [9, 2, 5], ¿qué valor debe quedar a su izquierda?',['2','9','Ninguno'],0,'2 es menor que 5. Tras particionar, la lista queda [2, 5, 9].',[9,2,5])
];
export function publicQuestion(q) {
 const {answer,explanation,...publicData}=q;
 return publicData;
}
