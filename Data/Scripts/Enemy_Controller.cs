using System;
using BellyRub;

namespace CSharpAssembly
{
	public class Enemy_Controller : ScriptController
	{
		private Rigidbody2DComponent rigidCompo = null;
		private PlayerController2DComponent enemyController = null;
		private SpriteAnimatorComponent enemyAni = null;
		private SpriteComponent sprite = null;

		public int maxWanderingDist = 0;
		public bool movingRight = true;
		public bool isMoving = false;

		public float velocityOffset = 0.05f;

		public Vector2 targetLocation = Vector2.Zero;
		public Vector2 lastLocation = Vector2.Zero;

		private float pivotXPos = 0; //This is the X Pos
	
		void Start()
		{
			rigidCompo = GetComponent<Rigidbody2DComponent>();
			enemyController = GetComponent<PlayerController2DComponent>();
			sprite = entity.GetChild(0).GetComponent<SpriteComponent>();
			enemyAni = entity.GetChild(0).GetComponent<SpriteAnimatorComponent>();

			pivotXPos = transform.position.x; //Grab the spawn location of the enemy that is should wander between.
		}

		void Update()
		{
			Vector2 velocity = rigidCompo.velocity;
			PassiveState(pivotXPos, ref movingRight);
			Animate(velocity);
		}

		void PassiveState(float initialXPos, ref bool moveRight)
		{
			float currentXPos = transform.position.x;
			
			Vector2 initialPosXVec = new Vector2 (initialXPos, 0);
			Vector2 targetPosXVec = new Vector2 (currentXPos, 0);

			float distance = Mathf.Distance(targetPosXVec, initialPosXVec);

			if (distance > maxWanderingDist)
			{
				moveRight = !moveRight;
				sprite.xFlip = !moveRight;
			}
			Vector2 dir = Vector2.Right;
			if(!moveRight)
			{
				dir = -Vector2.Right;
			}
			enemyController.Move(dir);
		}

		void Animate(Vector2 velocity)
		{
			if(enemyAni == null)
			{
				Debug.LogError($"We have lost the handle to {enemyAni}! Needs to be investigated..");
				return;
			}

			enemyAni.SetCurrentAnimation(1);
		}

	}
}