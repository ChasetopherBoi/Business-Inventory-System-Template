"""Add soft delete fields to users

Revision ID: e025de80ec32
Revises: bb82dafdbd4c
Create Date: 2026-02-10 16:53:04.692530

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "e025de80ec32"
down_revision: Union[str, Sequence[str], None] = "bb82dafdbd4c"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    with op.batch_alter_table("users") as batch_op:
        batch_op.add_column(sa.Column("is_deleted", sa.Boolean(), nullable=False))
        batch_op.add_column(sa.Column("deleted_at", sa.DateTime(), nullable=True))
    # ### end Alembic commands ###


def downgrade() -> None:
    """Downgrade schema."""
    with op.batch_alter_table("users") as batch_op:
        batch_op.drop_column("deleted_at")
        batch_op.drop_column("is_deleted")
    # ### end Alembic commands ###
