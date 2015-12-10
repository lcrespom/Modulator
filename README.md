#Agenda
- Prejuicios
- Ventajas
	- Integración con el editor
	- Caza errores frecuentes
	- ES6
- DefinitelyTyped
- Setup


##Prejuicios de TS
- Definición clásica de TS:
	- Bueno para proyectos grandes en los que JS no escala
	- Convierte JS en un lenguaje fuertemente tipado añadiendo robustez y organización
- Consecuencia: se descarta porque
	- Mi proyecto no es enorme
	- Me gusta la libertad de JavaScript

**Mostrar [ejemplo](http://pimterry.github.io/intro-to-typescript/#5)** en editor

##Realidad
- La integración con un editor "conchavado":
	- Caza errores frecuentes (la mayoría, despistes)
	- Aumenta la productividad
	- Ayuda a mantener el flow al permanecer más tiempo dentro del editor
- Ventaja añadida: ES6

##TypeScript y VS Code (y otros editores)
- Auto-complete / intellisense
	- Mostrando la documentación original
	- Documentación estilo JavaDoc
	- Interfaces predefinidas de las librerías estandar (DOM, HTML5...),
		y la gran mayoría de librerías y frameworks open source
- Errores cazados
	- Erratas en variables locales
	- Cuando te equivocas en un atributo
	- Cuando te dejas el this
	- Parámetros obligatorios vs opcionales
	- Funciones con variantes según el tipo de parámetro
	- Otros errores de compilación, no relacionados con tipos
		- Errores sintácticos como paréntesis o llaves mal cerradas
- Peek/jump to definition: ctrl+click / F12
- Ideal en refactorings donde se mueve mucho código

##Usando TypeScript en nuestros proyectos
- DefinitelyTyped
- Setup
	- tsconfig.json
	- webpack.config.js
	- package.json