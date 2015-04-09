package org.ontoware.text2onto.debug;

import java.net.URI;
import java.io.File;

import org.ontoware.text2onto.pom.POM;
import org.ontoware.text2onto.pom.POMFactory;
import org.ontoware.text2onto.corpus.Corpus;
import org.ontoware.text2onto.corpus.CorpusFactory;
import org.ontoware.text2onto.corpus.DocumentFactory;
import org.ontoware.text2onto.corpus.AbstractDocument;
import org.ontoware.text2onto.algorithm.AbstractAlgorithm;
import org.ontoware.text2onto.algorithm.AlgorithmController;
import org.ontoware.text2onto.algorithm.ComplexAlgorithm;
import org.ontoware.text2onto.algorithm.concept.*; 
import org.ontoware.text2onto.algorithm.auxiliary.context.*; 
import org.ontoware.text2onto.algorithm.instance.*;
import org.ontoware.text2onto.algorithm.similarity.ContextSimilarityExtraction;
import org.ontoware.text2onto.algorithm.taxonomic.subclassOf.*;
import org.ontoware.text2onto.algorithm.taxonomic.instanceOf.*;
import org.ontoware.text2onto.algorithm.relation.general.*;
import org.ontoware.text2onto.algorithm.relation.subtopicOf.*;
import org.ontoware.text2onto.algorithm.axiom.*; 
import org.ontoware.text2onto.algorithm.combiner.*;
import org.ontoware.text2onto.algorithm.normalizer.*;
import org.ontoware.text2onto.ontology.*;
import org.ontoware.text2onto.evidence.EvidenceManager;
import org.ontoware.text2onto.reference.ReferenceManager;


public class TestAllAlgorithms {

	public static void main( String args[] ) {
		String sCorpus = null;
		String sOntology = null;
		if ( args.length == 0 ) {
			System.exit( 0 );
		}
		if ( args.length > 0 ) {
			sCorpus = args[0];
		}
		if ( args.length > 1 ) {
			sOntology = args[1];
		}
		TestAllAlgorithms test = new TestAllAlgorithms( sCorpus, sOntology );
	}

	public TestAllAlgorithms( String sCorpusDir, String sOntology ) {
		try {
			Corpus corpus = CorpusFactory.newCorpus( sCorpusDir );
			System.out.println( "\n"+ corpus.toString() );

			POM pom = POMFactory.newPOM();

			AlgorithmController ac = new AlgorithmController( corpus, pom );
			
			// concept extraction
			
			ComplexAlgorithm cce = new ComplexAlgorithm();
			ac.addAlgorithm( cce );
    		
    		/* not sure, if using all of them is helpful, because this does not increase recall. the relevance values of the algorithms will be averaged for each concept. so, in some sense you lose control over the weighting schemes. same applies to instance extraction. */
    		
			ac.addAlgorithmTo( cce, new EntropyConceptExtraction() );
			ac.addAlgorithmTo( cce, new ExampleConceptExtraction() );
			ac.addAlgorithmTo( cce, new RTFConceptExtraction() );
			ac.addAlgorithmTo( cce, new TFIDFConceptExtraction() );
            
        	// instance extraction
        	
        	ComplexAlgorithm cie = new ComplexAlgorithm();
        	ac.addAlgorithm( cie );
        	
        	/* learning algorithms for the same task should always be bundled by means of a complex algorihtm. otherwise intermediate results might be overwritten */

			ac.addAlgorithmTo( cie, new ExampleInstanceExtraction() );
			ac.addAlgorithmTo( cie, new TFIDFInstanceExtraction() );

			// similarity extraction
           
			ContextSimilarityExtraction cse = new ContextSimilarityExtraction();
			ac.addAlgorithmTo( cse, new ContextExtractionWithoutStopwords() );
			ac.addAlgorithm( cse );

			// concept classification

			ComplexAlgorithm ccc = new ComplexAlgorithm();
            
			/* the average combiner is the default if nothing is set. unless you want another combiner you can skip this line. */
            
			ccc.setCombiner( new AverageCombiner() );
			ac.addAlgorithm( ccc );

			ac.addAlgorithmTo( ccc, new PatternConceptClassification() );
			ac.addAlgorithmTo( ccc, new VerticalRelationsConceptClassification() );
			ac.addAlgorithmTo( ccc, new WordNetConceptClassification() );

			// instance classification

			ComplexAlgorithm cic = new ComplexAlgorithm();
			cic.setCombiner( new AverageCombiner() );
			ac.addAlgorithm( cic );

			ac.addAlgorithmTo( cic, new ContextInstanceClassification() );
			ac.addAlgorithmTo( cic, new PatternInstanceClassification() );

			// relation extraction
	
			ac.addAlgorithm( new SubcatRelationExtraction() );

			// subtopic extraction

			ComplexAlgorithm cte = new ComplexAlgorithm();
			cte.setCombiner( new AverageCombiner() );
			ac.addAlgorithm( cte );
    
			ac.addAlgorithmTo( cte, new SubtopicOfRelationExtraction() );
			ac.addAlgorithmTo( cte, new SubtopicOfRelationConversion() );

			// disjointness
			
			ac.addAlgorithm( new PatternDisjointClassesExtraction() );
			
			System.out.println( "\nAlgorithmController: "+ ac );
			
			ac.execute();
 
			// POMTable pomtable = new POMTable( pom );
			
			System.out.println( "\nPOM:\n"+ pom +"\n" );
			
			System.out.println( "\nPOM (details):\n"+ pom.toStringDetails() +"\n" );		
				 
			// write( ac, sOntology +".rdfs" );
			// write( ac, sOntology +".kaon" );
			write( ac, sOntology +".owl" );
			// write( ac, sOntology +".ser" );
		} 
		catch ( Exception e ) {
			e.printStackTrace();
		}
	}
	
	private void write( AlgorithmController ac, String sOntology ) throws Exception {
		System.err.println( "\nTestAlgorithms.write: "+ sOntology +"..." );
		POM pom = ac.getPOM();
		OntologyWriter writer = null; 
		if( sOntology.endsWith( ".rdf" ) || sOntology.endsWith( ".rdfs" ) ){
			writer = new RDFSWriter( pom ); 
		}
		else if( sOntology.endsWith( ".kaon" ) ){ 
			writer = new KAONWriter( pom ); 
		} 
		else if( sOntology.endsWith( ".owl" ) ){
			writer = new OWLWriter( pom );
		}
		else if( sOntology.endsWith( ".ser" ) ){
			File file = new File( new URI( sOntology ) );
			pom.save( file.toString() );
			writer = null;
		}
		if( writer != null ){
			writer.setReferenceManager( ac.getReferenceManager() );
			writer.setEvidenceManager( ac.getEvidenceManager() ); 
			writer.write( new URI( sOntology ) ); 
		}
	}
}
