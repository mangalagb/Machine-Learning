@echo on

set T2O=g:\text2onto\software
set LIB=%T2O%\3rdparty
set GATE=f:/gate

set t2o_classpath=%T2O%\build\bin\new;%LIB%\gate\gate.jar;%LIB%\gate\ontotext.jar;%LIB%\gate\jasper-compiler-jdt.jar;%LIB%\gate\heptag.jar;%LIB%\gate\xstream-1.2.jar;%LIB%\gate\nekohtml-0.9.5.jar;%LIB%\gate\xercesImpl.jar;%LIB%\gate\xpp3-1.1.3.3_min.jar;%LIB%\gnu-regexp-1.0.8.jar;%LIB%\jdom.jar;%LIB%\jwnl\jwnl.jar;%LIB%\commons-logging.jar;%LIB%\kaon\kaonapi.jar;%LIB%\kaon\apionrdf.jar;%LIB%\kaon\rdfapi.jar;%LIB%\kaon\query.jar;%LIB%\kaon\datalog.jar;%LIB%\kaon2\kaon2.jar;%LIB%\aclibico.jar;%LIB%\PDFBox-0.7.2.jar;%LIB%\log4j-1.2.11.jar;%LIB%\junit.jar;%LIB%\je-3.1.0.jar;%LIB%\google\googleapi.jar;

java -cp %t2o_classpath% -ms1200M -mx1200M -Dgate.home=%GATE% -Dgate.config=%GATE%/gate.xml -Dgate.plugins.home=%GATE%/plugins -Dload.plugin.path=file:/%GATE%/plugins/ANNIE -Djava.library.path=g:/text2onto/software/3rdparty/eclipse/os/win32/x86 -Dfile.encoding=ISO-8859-1 org.ontoware.text2onto.debug.TestSpanish file:/g:/corpus/corpus_sw_es2/ file:/g:/text2onto/software/ontology













