import { moveFor } from '../data/moves.js';
import { GuideModal } from './GuideModal.jsx';

export function MoveModal({name, kicker, onClose}){
  const move = name ? moveFor(name) : null;
  return (
    <GuideModal
      open={!!name}
      kicker={kicker || 'How to do it'}
      title={name}
      note="Match the video, then use the sets and rest on the card. Stop if a joint pinches or feels unstable."
      steps={move?.steps}
      href={move?.youtube}
      linkLabel="Watch on YouTube"
      onClose={onClose}
    />
  );
}
