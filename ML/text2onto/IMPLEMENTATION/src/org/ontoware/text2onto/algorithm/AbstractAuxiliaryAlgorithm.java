package org.ontoware.text2onto.algorithm;

import java.util.List;

import org.ontoware.text2onto.change.ChangeRequest;

/**
 * @author G�nter Ladwig
 */
public abstract class AbstractAuxiliaryAlgorithm extends AbstractAlgorithm {

	protected abstract List<ChangeRequest> getEvidenceChanges() throws Exception;
}
