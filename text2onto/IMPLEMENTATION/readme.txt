 
Installation (Windows)

1. Unzip Text2Onto.zip to <T2O-DIR> (e.g. c:\text2onto).

2. Install GATE 4.0 (http://gate.ac.uk) to <GATE-DIR>.

3. Install WordNet (http://wordnet.princeton.edu/) 2.0 to <WN-DIR>.
  
4. Modify text2onto.properties.

	language=english
	gate_dir=<T2O-DIR>/3rdparty/gate/
	gate_app=application.gate 
	jape_main=main.jape
	stop_file=stopwords.txt
	creole_dir=<T2O-DIR>/3rdparty/gate/
	jwnl_properties=<T2O-DIR>/3rdparty/jwnl/file_properties.xml
	temp_corpus=<TEMP-DIR>/text2onto/ 
	icons=<T2O-DIR>/icons/
	datastore=serial
	tagger_dir=<TAGGER-DIR>/bin/
	spanish_wn_dir=<SPANISH-WN-DIR>

5. Modify 3rdparty/jwnl/file_properties.xml.

	[...]
	<param name="file_manager" value="net.didion.jwnl.dictionary.file_manager.FileManagerImpl">
		<param name="file_type" value="net.didion.jwnl.princeton.file.PrincetonRandomAccessDictionaryFile"/>
		<param name="dictionary_path" value="<WN-DIR>\dict"/>
	</param>
	[...]

6. Modify Text2onto.bat.

	@echo off
	set T2O=<T2O-DIR>
	set LIB=%T2O%\3rdparty
	set GATE=<GATE-DIR>
	[...]
	
7. Start text2onto.bat.	
	
8. &:) Have fun.


